import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import type { D1Database } from "@cloudflare/workers-types";
import { dashboard } from "./dashboard";
import { deliver, type EmailEnv, type OutboxItem } from "./email";
import { validateEnquiry, statuses, type Status } from "./validation";

type Env = EmailEnv & {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  CONSENT_VERSION: string;
  RATE_LIMIT_SALT?: string;
  LOCAL_ADMIN_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
};
type Staff = { email: string; role: "triage" | "lead" | "admin" };
const json = (body: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  });
const now = () => new Date().toISOString();
const log = (event: string, requestId: string, status: number) =>
  console.log(JSON.stringify({ event, requestId, status }));
async function digest(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function cors(origin: string | null, env: Env): HeadersInit {
  return origin && env.ALLOWED_ORIGINS.split(",").includes(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
        Vary: "Origin",
      }
    : {};
}
function sameOrigin(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  return !!origin && env.ALLOWED_ORIGINS.split(",").includes(origin);
}
function errorCode(error: unknown) {
  return error instanceof Error ? error.message : "invalid_request";
}

/** Access identity tokens must be time-bounded, app-scoped, and carry a user identity. */
export function accessIdentity(
  payload: JWTPayload,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (
    payload.type !== "app" ||
    typeof payload.exp !== "number" ||
    !Number.isFinite(payload.exp) ||
    payload.exp <= nowSeconds
  )
    return null;
  if (
    typeof payload.email !== "string" ||
    payload.email.trim().length === 0 ||
    payload.email.length > 254
  )
    return null;
  return payload.email.trim().toLowerCase();
}

async function turnstile(token: string, request: Request, env: Env) {
  const requestHost = new URL(request.url).hostname;
  if (
    env.ENVIRONMENT === "local" &&
    ["localhost", "127.0.0.1"].includes(requestHost) &&
    token === "local-test"
  )
    return true;
  if (!env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_EXPECTED_HOSTNAME)
    return false;
  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };
  return (
    result.success === true &&
    result.hostname === env.TURNSTILE_EXPECTED_HOSTNAME &&
    result.action === "enquiry"
  );
}

async function rateLimit(request: Request, env: Env) {
  if (!env.RATE_LIMIT_SALT) throw new Error("rate_limit_not_configured");
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    (env.ENVIRONMENT === "local" ? "local" : "unknown");
  const key = await digest(`${env.RATE_LIMIT_SALT}:${ip}`);
  const current = now();
  await env.DB.prepare(
    "DELETE FROM rate_limits WHERE key_hash = ? AND expires_at < ?",
  )
    .bind(key, current)
    .run();
  await env.DB.prepare(
    "INSERT INTO rate_limits(key_hash,count,expires_at) VALUES(?,1,datetime('now','+1 hour')) ON CONFLICT(key_hash) DO UPDATE SET count=count+1",
  )
    .bind(key)
    .run();
  const row = await env.DB.prepare(
    "SELECT count FROM rate_limits WHERE key_hash = ?",
  )
    .bind(key)
    .first<{ count: number }>();
  return (row?.count || 0) <= 20;
}

async function submit(request: Request, env: Env, requestId: string) {
  const headers = cors(request.headers.get("Origin"), env);
  if (!sameOrigin(request, env))
    return json({ error: "origin_not_allowed" }, 403, headers);
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return json({ error: "json_required" }, 415, headers);
  if (Number(request.headers.get("Content-Length") || 0) > 16384)
    return json({ error: "request_too_large" }, 413, headers);
  let payload: ReturnType<typeof validateEnquiry>;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 16384)
      return json({ error: "request_too_large" }, 413, headers);
    payload = validateEnquiry(JSON.parse(body));
  } catch (e) {
    return json(
      { error: e instanceof SyntaxError ? "invalid_json" : errorCode(e) },
      400,
      headers,
    );
  }
  const key = request.headers.get("Idempotency-Key");
  if (!key || !/^[0-9a-f-]{36}$/i.test(key))
    return json({ error: "idempotency_key_required" }, 400, headers);
  const { turnstileToken: _token, ...stored } = payload;
  void _token;
  const hash = await digest(JSON.stringify(stored));
  try {
    const existing = await env.DB.prepare(
      "SELECT reference,payload_hash FROM enquiries WHERE idempotency_key=?",
    )
      .bind(key)
      .first<{ reference: string; payload_hash: string }>();
    if (existing)
      return existing.payload_hash === hash
        ? json(
            {
              reference: existing.reference,
              status: "received",
              duplicate: true,
            },
            200,
            headers,
          )
        : json({ error: "idempotency_conflict" }, 409, headers);
    if (!(await rateLimit(request, env)))
      return json({ error: "rate_limited" }, 429, {
        ...headers,
        "Retry-After": "3600",
      });
    if (!(await turnstile(payload.turnstileToken, request, env)))
      return json({ error: "verification_failed" }, 403, headers);
    const id = crypto.randomUUID(),
      timestamp = now();
    const reference = `TT-${timestamp.slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const statements = [
      env.DB.prepare(
        "INSERT INTO enquiries(id,reference,kind,name,email,phone,organization,location,subject,message,product_slug,preferred_language,preferred_channel,consent_version,consent_at,source_url,idempotency_key,payload_hash,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      ).bind(
        id,
        reference,
        payload.kind,
        payload.name,
        payload.email,
        payload.phone,
        payload.organization,
        payload.location,
        payload.subject,
        payload.message,
        payload.productSlug,
        payload.preferredLanguage,
        payload.preferredChannel,
        env.CONSENT_VERSION,
        timestamp,
        payload.sourceUrl,
        key,
        hash,
        timestamp,
        timestamp,
      ),
      env.DB.prepare(
        "INSERT INTO status_events(id,enquiry_id,old_status,new_status,actor,created_at) VALUES(?,?,?,?,?,?)",
      ).bind(crypto.randomUUID(), id, null, "new", "system", timestamp),
      env.DB.prepare(
        "INSERT INTO notification_outbox(id,enquiry_id,event_type,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?)",
      ).bind(
        crypto.randomUUID(),
        id,
        "admin_alert",
        timestamp,
        timestamp,
        timestamp,
      ),
    ];
    if (payload.email && payload.preferredChannel === "email")
      statements.push(
        env.DB.prepare(
          "INSERT INTO notification_outbox(id,enquiry_id,event_type,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        ).bind(
          crypto.randomUUID(),
          id,
          "acknowledgement",
          timestamp,
          timestamp,
          timestamp,
        ),
      );
    await env.DB.batch(statements);
    log("enquiry_received", requestId, 201);
    return json({ reference, status: "received" }, 201, headers);
  } catch {
    log("enquiry_storage_failed", requestId, 503);
    return json({ error: "temporarily_unavailable", requestId }, 503, headers);
  }
}

async function staff(request: Request, env: Env): Promise<Staff | null> {
  const local = request.headers.get("X-Local-Admin-Token");
  if (
    env.ENVIRONMENT === "local" &&
    env.LOCAL_ADMIN_TOKEN &&
    local === env.LOCAL_ADMIN_TOKEN
  )
    return { email: "local-admin", role: "admin" };
  if (env.ENVIRONMENT === "local" || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD)
    return null;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;
  try {
    const domain = new URL(env.ACCESS_TEAM_DOMAIN);
    if (domain.protocol !== "https:") return null;
    const jwks = createRemoteJWKSet(new URL("/cdn-cgi/access/certs", domain));
    const result = await jwtVerify(token, jwks, {
      issuer: domain.origin,
      audience: env.ACCESS_AUD,
      algorithms: ["RS256"],
    });
    const email = accessIdentity(result.payload);
    if (!email) return null;
    const role = await env.DB.prepare(
      "SELECT role FROM staff_roles WHERE email=? AND active=1",
    )
      .bind(email)
      .first<{ role: Staff["role"] }>();
    return role ? { email, role: role.role } : null;
  } catch {
    return null;
  }
}
function safeCsv(value: unknown) {
  const s = String(value ?? "");
  return `"${/^[=+@\-\t\r]/u.test(s) ? "'" : ""}${s.replace(/"/g, '""')}"`;
}
async function audit(
  env: Env,
  actor: string,
  action: string,
  target: string | null,
  requestId: string,
) {
  await env.DB.prepare(
    "INSERT INTO audit_events(id,actor,action,target,request_id,created_at) VALUES(?,?,?,?,?,?)",
  )
    .bind(crypto.randomUUID(), actor, action, target, requestId, now())
    .run();
}
async function admin(request: Request, env: Env, url: URL, requestId: string) {
  const user = await staff(request, env);
  if (!user) return json({ error: "unauthorized" }, 401);
  if (request.method !== "GET" && request.headers.get("Origin") !== url.origin)
    return json({ error: "origin_not_allowed" }, 403);
  const segments = url.pathname.split("/").filter(Boolean);
  try {
    if (
      segments.length === 2 &&
      segments[1] === "enquiries" &&
      request.method === "GET"
    ) {
      const status = url.searchParams.get("status") || null,
        kind = url.searchParams.get("kind") || null,
        q = url.searchParams.get("q")?.slice(0, 100) || "";
      const limit = Math.min(
        100,
        Math.max(1, Number(url.searchParams.get("limit") || 30)),
      );
      const rows = await env.DB.prepare(
        "SELECT id,reference,kind,status,name,email,phone,subject,created_at,updated_at FROM enquiries WHERE (? IS NULL OR status=?) AND (? IS NULL OR kind=?) AND (reference LIKE ? OR name LIKE ? OR email LIKE ?) ORDER BY created_at DESC LIMIT ?",
      )
        .bind(status, status, kind, kind, `%${q}%`, `%${q}%`, `%${q}%`, limit)
        .all();
      await audit(env, user.email, "list", null, requestId);
      return json({ items: rows.results });
    }
    if (
      segments.length === 3 &&
      segments[1] === "enquiries" &&
      request.method === "GET"
    ) {
      const record = await env.DB.prepare(
        "SELECT * FROM enquiries WHERE id=? OR reference=?",
      )
        .bind(segments[2], segments[2])
        .first();
      if (!record) return json({ error: "not_found" }, 404);
      const events = await env.DB.prepare(
        "SELECT old_status,new_status,actor,created_at FROM status_events WHERE enquiry_id=? ORDER BY created_at",
      )
        .bind(record.id)
        .all();
      const notes = await env.DB.prepare(
        "SELECT author,body,created_at FROM internal_notes WHERE enquiry_id=? ORDER BY created_at",
      )
        .bind(record.id)
        .all();
      const notifications = await env.DB.prepare(
        "SELECT id,event_type,state,attempts,next_attempt_at,last_error FROM notification_outbox WHERE enquiry_id=?",
      )
        .bind(record.id)
        .all();
      await audit(env, user.email, "read", String(record.id), requestId);
      return json({
        record,
        events: events.results,
        notes: notes.results,
        notifications: notifications.results,
      });
    }
    if (
      segments.length === 4 &&
      segments[1] === "enquiries" &&
      segments[3] === "status" &&
      request.method === "PATCH"
    ) {
      const body = (await request.json()) as { status?: Status };
      if (!statuses.includes(body.status as Status))
        return json({ error: "invalid_status" }, 400);
      const record = await env.DB.prepare(
        "SELECT id,status,email,reference,kind FROM enquiries WHERE id=?",
      )
        .bind(segments[2])
        .first<{
          id: string;
          status: Status;
          email: string | null;
          reference: string;
          kind: string;
        }>();
      if (!record) return json({ error: "not_found" }, 404);
      if (record.status !== body.status) {
        const timestamp = now();
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE enquiries SET status=?,updated_at=? WHERE id=?",
          ).bind(body.status, timestamp, record.id),
          env.DB.prepare(
            "INSERT INTO status_events(id,enquiry_id,old_status,new_status,actor,created_at) VALUES(?,?,?,?,?,?)",
          ).bind(
            crypto.randomUUID(),
            record.id,
            record.status,
            body.status,
            user.email,
            timestamp,
          ),
        ]);
      }
      await audit(env, user.email, "status", record.id, requestId);
      return json({ status: body.status });
    }
    if (
      segments.length === 4 &&
      segments[1] === "enquiries" &&
      segments[3] === "notes" &&
      request.method === "POST"
    ) {
      const body = (await request.json()) as { body?: string };
      const note = body.body?.trim();
      if (!note || note.length > 2000)
        return json({ error: "invalid_note" }, 400);
      const record = await env.DB.prepare("SELECT id FROM enquiries WHERE id=?")
        .bind(segments[2])
        .first();
      if (!record) return json({ error: "not_found" }, 404);
      await env.DB.prepare(
        "INSERT INTO internal_notes(id,enquiry_id,author,body,created_at) VALUES(?,?,?,?,?)",
      )
        .bind(crypto.randomUUID(), segments[2], user.email, note, now())
        .run();
      await audit(env, user.email, "note", segments[2], requestId);
      return json({ saved: true }, 201);
    }
    if (segments[1] === "export" && request.method === "GET") {
      if (user.role !== "lead" && user.role !== "admin")
        return json({ error: "forbidden" }, 403);
      const since = url.searchParams.get("since"),
        until = url.searchParams.get("until");
      if (
        !since ||
        !until ||
        !/^\d{4}-\d{2}-\d{2}$/u.test(since) ||
        !/^\d{4}-\d{2}-\d{2}$/u.test(until) ||
        Date.parse(until) - Date.parse(since) > 31 * 86400000
      )
        return json({ error: "bounded_date_range_required" }, 400);
      const rows = await env.DB.prepare(
        "SELECT reference,kind,status,name,email,phone,organization,location,subject,message,created_at FROM enquiries WHERE created_at>=? AND created_at<? ORDER BY created_at LIMIT 1000",
      )
        .bind(`${since}T00:00:00.000Z`, `${until}T23:59:59.999Z`)
        .all<Record<string, unknown>>();
      const cols = [
        "reference",
        "kind",
        "status",
        "name",
        "email",
        "phone",
        "organization",
        "location",
        "subject",
        "message",
        "created_at",
      ];
      const csv = [
        cols.join(","),
        ...rows.results.map((row) =>
          cols.map((col) => safeCsv(row[col])).join(","),
        ),
      ].join("\r\n");
      await audit(env, user.email, "export", `${since}:${until}`, requestId);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=enquiries.csv",
          "Cache-Control": "no-store",
        },
      });
    }
    if (segments[1] === "outbox" && request.method === "GET") {
      const rows = await env.DB.prepare(
        "SELECT id,enquiry_id,event_type,state,attempts,next_attempt_at,last_error FROM notification_outbox ORDER BY created_at DESC LIMIT 100",
      ).all();
      await audit(env, user.email, "outbox", null, requestId);
      return json({ items: rows.results });
    }
    if (
      segments.length === 4 &&
      segments[1] === "outbox" &&
      segments[3] === "retry" &&
      request.method === "POST"
    ) {
      if (user.role !== "lead" && user.role !== "admin")
        return json({ error: "forbidden" }, 403);
      const row = await env.DB.prepare(
        "SELECT id,state FROM notification_outbox WHERE id=?",
      )
        .bind(segments[2])
        .first<{ id: string; state: string }>();
      if (!row) return json({ error: "not_found" }, 404);
      if (row.state !== "failed")
        return json({ error: "retry_only_failed" }, 409);
      await env.DB.prepare(
        "UPDATE notification_outbox SET state='pending',attempts=0,last_error=NULL,next_attempt_at=?,updated_at=? WHERE id=? AND state='failed'",
      )
        .bind(now(), now(), segments[2])
        .run();
      await audit(env, user.email, "retry_outbox", segments[2], requestId);
      return json({ queued: true });
    }
    if (
      segments[1] === "dispatch" &&
      request.method === "POST" &&
      env.ENVIRONMENT === "local"
    ) {
      const count = await processOutbox(env);
      await audit(env, user.email, "dispatch", null, requestId);
      return json({ processed: count });
    }
    return json({ error: "not_found" }, 404);
  } catch {
    log("admin_error", requestId, 500);
    return json({ error: "temporarily_unavailable", requestId }, 500);
  }
}

export async function processOutbox(env: Env) {
  const due = await env.DB.prepare(
    "SELECT o.id,o.enquiry_id,o.event_type,e.reference,e.kind,e.email,e.status FROM notification_outbox o JOIN enquiries e ON e.id=o.enquiry_id WHERE o.state IN ('pending','failed') AND o.next_attempt_at<=? AND o.attempts<6 ORDER BY o.created_at LIMIT 20",
  )
    .bind(now())
    .all<OutboxItem & { enquiry_id: string }>();
  let processed = 0;
  for (const item of due.results) {
    const claim = await env.DB.prepare(
      "UPDATE notification_outbox SET state='sending',attempts=attempts+1,updated_at=? WHERE id=? AND state IN ('pending','failed')",
    )
      .bind(now(), item.id)
      .run();
    if (!claim.meta.changes) continue;
    try {
      const sent = await deliver(item, env);
      await env.DB.prepare(
        "UPDATE notification_outbox SET state=?,provider_id=?,last_error=NULL,updated_at=? WHERE id=?",
      )
        .bind(sent.state, sent.providerId, now(), item.id)
        .run();
    } catch (e) {
      const code = errorCode(e).slice(0, 80);
      await env.DB.prepare(
        "UPDATE notification_outbox SET state='failed',last_error=?,next_attempt_at=datetime('now', '+' || min(3600, (1 << min(attempts,6))*60) || ' seconds'),updated_at=? WHERE id=?",
      )
        .bind(code, now(), item.id)
        .run();
    }
    processed++;
  }
  return processed;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url),
      requestId = crypto.randomUUID();
    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      if (env.ENVIRONMENT !== "local" && !(await staff(request, env)))
        return json({ error: "unauthorized" }, 401);
      return new Response(dashboard, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy":
            "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
        },
      });
    }
    if (url.pathname === "/v1/enquiries" && request.method === "OPTIONS")
      return sameOrigin(request, env)
        ? new Response(null, {
            status: 204,
            headers: cors(request.headers.get("Origin"), env),
          })
        : json({ error: "origin_not_allowed" }, 403);
    if (url.pathname === "/v1/enquiries" && request.method === "POST")
      return submit(request, env, requestId);
    if (url.pathname.startsWith("/admin/"))
      return admin(request, env, url, requestId);
    return json({ error: "not_found" }, 404);
  },
  async scheduled(_event: unknown, env: Env) {
    await env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?")
      .bind(now())
      .run();
    await processOutbox(env);
  },
};
export default worker;
