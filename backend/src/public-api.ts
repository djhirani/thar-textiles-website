import type { D1Database } from "@cloudflare/workers-types";
import { validateEnquiry } from "./validation";
type Env = {
  DB: D1Database;
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  CONSENT_VERSION: string;
  RATE_LIMIT_SALT?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
};
const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
const now = () => new Date().toISOString();
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
function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  return !!origin && env.ALLOWED_ORIGINS.split(",").includes(origin);
}
async function checkTurnstile(token: string, request: Request, env: Env) {
  const host = new URL(request.url).hostname;
  if (
    env.ENVIRONMENT === "local" &&
    ["localhost", "127.0.0.1"].includes(host) &&
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
  const ip = request.headers.get("CF-Connecting-IP") || "unknown",
    key = await digest(`${env.RATE_LIMIT_SALT}:${ip}`),
    current = now();
  await env.DB.prepare(
    "DELETE FROM rate_limits WHERE key_hash=? AND julianday(expires_at)<=julianday(?)",
  )
    .bind(key, current)
    .run();
  await env.DB.prepare(
    "INSERT INTO rate_limits(key_hash,count,expires_at) VALUES(?,1,strftime('%Y-%m-%dT%H:%M:%fZ','now','+1 hour')) ON CONFLICT(key_hash) DO UPDATE SET count=count+1",
  )
    .bind(key)
    .run();
  const row = await env.DB.prepare(
    "SELECT count FROM rate_limits WHERE key_hash=?",
  )
    .bind(key)
    .first<{ count: number }>();
  return (row?.count || 0) <= 20;
}
async function submit(request: Request, env: Env) {
  const origin = request.headers.get("Origin"),
    headers = cors(origin, env);
  if (!allowedOrigin(request, env))
    return json({ error: "origin_not_allowed" }, 403, headers);
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return json({ error: "json_required" }, 415, headers);
  const size = Number(request.headers.get("Content-Length") || 0);
  if (size > 16384) return json({ error: "request_too_large" }, 413, headers);
  let payload: ReturnType<typeof validateEnquiry>;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 16384)
      return json({ error: "request_too_large" }, 413, headers);
    payload = validateEnquiry(JSON.parse(body));
  } catch (e) {
    return json(
      {
        error:
          e instanceof SyntaxError
            ? "invalid_json"
            : e instanceof Error
              ? e.message
              : "invalid_request",
      },
      400,
      headers,
    );
  }
  const key = request.headers.get("Idempotency-Key");
  if (!key || !/^[0-9a-f-]{36}$/iu.test(key))
    return json({ error: "idempotency_key_required" }, 400, headers);
  const { turnstileToken, ...stored } = payload,
    hash = await digest(JSON.stringify(stored));
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
    if (!(await checkTurnstile(turnstileToken, request, env)))
      return json({ error: "verification_failed" }, 403, headers);
    const id = crypto.randomUUID(),
      at = now(),
      reference = `TT-${at.slice(0, 10).replace(/-/gu, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
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
        at,
        payload.sourceUrl,
        key,
        hash,
        at,
        at,
      ),
      env.DB.prepare(
        "INSERT INTO status_events(id,enquiry_id,old_status,new_status,actor,created_at) VALUES(?,?,?,?,?,?)",
      ).bind(crypto.randomUUID(), id, null, "new", "system", at),
      env.DB.prepare(
        "INSERT INTO notification_outbox(id,enquiry_id,event_type,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?)",
      ).bind(crypto.randomUUID(), id, "admin_alert", at, at, at),
    ];
    if (payload.email && payload.preferredChannel === "email")
      statements.push(
        env.DB.prepare(
          "INSERT INTO notification_outbox(id,enquiry_id,event_type,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        ).bind(crypto.randomUUID(), id, "acknowledgement", at, at, at),
      );
    await env.DB.batch(statements);
    return json({ reference, status: "received" }, 201, headers);
  } catch {
    return json({ error: "temporarily_unavailable" }, 503, headers);
  }
}
const publicWorker = {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname !== "/v1/enquiries")
      return json({ error: "not_found" }, 404);
    if (request.method === "OPTIONS")
      return allowedOrigin(request, env)
        ? new Response(null, {
            status: 204,
            headers: cors(request.headers.get("Origin"), env),
          })
        : json({ error: "origin_not_allowed" }, 403);
    if (request.method === "POST") return submit(request, env);
    return json({ error: "method_not_allowed" }, 405, {
      Allow: "POST, OPTIONS",
    });
  },
  async scheduled(_event: unknown, env: Env) {
    await env.DB.prepare(
      "DELETE FROM rate_limits WHERE julianday(expires_at)<=julianday(?)",
    )
      .bind(now())
      .run();
  },
};
export default publicWorker;
