import type { D1Database } from "@cloudflare/workers-types";
import {
  allowedGithubId,
  cookieHeader,
  cookieValue,
  pkcePair,
  randomToken,
  signCookie,
  stateDigest,
  validOAuthStateCookie,
  validSession,
  verifyCookie,
} from "./github-auth";
import { statuses, type Status } from "./validation";

type Env = {
  DB: D1Database;
  ENVIRONMENT: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_CALLBACK_URL?: string;
  GITHUB_ALLOWED_USER_IDS?: string;
  SESSION_SIGNING_KEY?: string;
};
const SESSION = "__Host-tt_session",
  OAUTH = "__Host-tt_oauth";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const timestamp = () => new Date().toISOString();
const securePageHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
const adminPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Thar Textiles · Staging enquiries</title><style>:root{font:16px system-ui;color:#193144;background:#f7f1e7}*{box-sizing:border-box}body{margin:0}header{background:#193144;color:white;padding:1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem}main{max-width:1100px;margin:auto;padding:1rem}button,input,select,textarea{font:inherit;min-height:44px;padding:.6rem;border:1px solid #aaa;border-radius:5px}button{background:#193144;color:white;cursor:pointer}form{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0}section{background:white;padding:1rem;margin:1rem 0;border-radius:8px}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:.65rem;border-bottom:1px solid #ddd;overflow-wrap:anywhere}textarea{width:100%;min-height:90px}#detail{display:none}#notice{min-height:1.5rem}.scroll{overflow:auto}@media(max-width:600px){main{padding:.5rem}td,th{min-width:110px}}</style></head><body><header><strong>Thar Textiles · Staging administration</strong><form id="logout"><button>Sign out</button></form></header><main><p id="notice" role="status">Loading enquiries…</p><form id="filters"><select id="status" aria-label="Status"><option value="">All statuses</option><option>new</option><option>pending</option><option>contacted</option><option>completed</option></select><select id="kind" aria-label="Enquiry type"><option value="">All types</option><option>wholesale</option><option>artisan</option><option>partnership</option><option>expert</option><option>general</option></select><input id="query" placeholder="Reference, name or email" aria-label="Search"><button>Search</button></form><section><h2>Enquiries</h2><div class="scroll"><table><thead><tr><th>Reference</th><th>Type</th><th>Status</th><th>Name</th><th>Received</th></tr></thead><tbody id="rows"></tbody></table></div></section><section id="detail"><h2 id="heading"></h2><div id="fields"></div><h3>Update status</h3><form id="statusForm"><select id="nextStatus" aria-label="New status"><option>new</option><option>pending</option><option>contacted</option><option>completed</option></select><button>Save status</button></form><h3>Private follow-up note</h3><form id="noteForm"><textarea id="note" maxlength="2000" required aria-label="Private note"></textarea><button>Add note</button></form><h3>History and notifications</h3><div id="history"></div></section><section><h2>Export</h2><p>Export a bounded date range. Staging contains synthetic records only.</p><form id="exportForm"><label>From <input id="since" type="date" required></label><label>Through <input id="until" type="date" required></label><button>Export CSV</button></form></section></main><script>const $=id=>document.getElementById(id);let active=null;async function api(path,options={}){const r=await fetch(path,{credentials:'same-origin',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});if(r.status===401){location.assign('/auth/login');throw Error('Your session expired. Sign in again.')}if(!r.ok)throw Error('Request failed ('+r.status+')');return r}function line(parent,label,value){const p=document.createElement('p'),b=document.createElement('strong');b.textContent=label+': ';p.append(b,document.createTextNode(value??'—'));parent.append(p)}async function list(){try{const q=new URLSearchParams({status:$('status').value,kind:$('kind').value,q:$('query').value});const data=await(await api('/admin/enquiries?'+q)).json();$('notice').textContent=data.items.length+' enquiries shown';$('rows').replaceChildren();for(const row of data.items){const tr=document.createElement('tr');for(const key of ['reference','kind','status','name','created_at']){const td=document.createElement('td');if(key==='reference'){const b=document.createElement('button');b.textContent=row[key];b.onclick=()=>detail(row.id);td.append(b)}else td.textContent=row[key]||'';tr.append(td)}$('rows').append(tr)}}catch(e){$('notice').textContent=e.message}}async function detail(id){try{const d=await(await api('/admin/enquiries/'+encodeURIComponent(id))).json();active=id;$('detail').style.display='block';$('heading').textContent=d.record.reference;$('fields').replaceChildren();for(const k of ['kind','status','name','email','phone','organization','location','subject','message','product_slug','preferred_language','preferred_channel','created_at'])line($('fields'),k.replaceAll('_',' '),d.record[k]);$('nextStatus').value=d.record.status;$('history').replaceChildren();for(const e of d.events)line($('history'),'Status '+e.created_at,e.old_status+' → '+e.new_status+' by '+e.actor);for(const n of d.notes)line($('history'),'Private note '+n.created_at,n.body+' — '+n.author);for(const n of d.notifications)line($('history'),'Notification '+n.event_type,n.state+' ('+n.attempts+' attempts)');$('detail').scrollIntoView({behavior:'smooth'})}catch(e){$('notice').textContent=e.message}}$('filters').onsubmit=e=>{e.preventDefault();list()};$('statusForm').onsubmit=async e=>{e.preventDefault();try{await api('/admin/enquiries/'+active+'/status',{method:'PATCH',body:JSON.stringify({status:$('nextStatus').value})});await detail(active);await list()}catch(x){$('notice').textContent=x.message}};$('noteForm').onsubmit=async e=>{e.preventDefault();try{await api('/admin/enquiries/'+active+'/notes',{method:'POST',body:JSON.stringify({body:$('note').value})});$('note').value='';await detail(active)}catch(x){$('notice').textContent=x.message}};$('exportForm').onsubmit=async e=>{e.preventDefault();try{const q=new URLSearchParams({since:$('since').value,until:$('until').value}),blob=await(await api('/admin/export?'+q)).blob(),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='enquiries.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}catch(x){$('notice').textContent=x.message}};$('logout').onsubmit=async e=>{e.preventDefault();await api('/auth/logout',{method:'POST'});location.assign('/')};list();</script></body></html>`;
function clearCookie(name: string) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
function actor(id: number) {
  return `github:${id}`;
}
async function audit(
  env: Env,
  id: number,
  action: string,
  target: string | null,
  requestId: string,
) {
  await env.DB.prepare(
    "INSERT INTO audit_events(id,actor,action,target,request_id,created_at) VALUES(?,?,?,?,?,?)",
  )
    .bind(
      crypto.randomUUID(),
      actor(id),
      action,
      target,
      requestId,
      timestamp(),
    )
    .run();
}
function safeCsv(value: unknown) {
  const s = String(value ?? "");
  return `"${/^[=+@\-\t\r]/u.test(s) ? "'" : ""}${s.replace(/"/gu, '""')}"`;
}

async function startLogin(request: Request, env: Env) {
  const callback = env.GITHUB_CALLBACK_URL;
  if (
    !callback ||
    !env.GITHUB_CLIENT_ID ||
    !env.GITHUB_CLIENT_SECRET ||
    !env.SESSION_SIGNING_KEY ||
    env.SESSION_SIGNING_KEY.length < 32 ||
    !env.GITHUB_ALLOWED_USER_IDS
  )
    return json({ error: "authentication_not_configured" }, 503);
  const callbackUrl = new URL(callback),
    requestUrl = new URL(request.url);
  if (
    callbackUrl.protocol !== "https:" ||
    callbackUrl.origin !== requestUrl.origin ||
    callbackUrl.pathname !== "/auth/callback" ||
    callbackUrl.search ||
    callbackUrl.hash
  )
    return json({ error: "authentication_not_configured" }, 503);
  const state = randomToken(),
    { verifier, challenge } = await pkcePair(),
    issued = Math.floor(Date.now() / 1000);
  const stateHash = await stateDigest(state);
  await env.DB.prepare("DELETE FROM github_oauth_states WHERE expires_at<?")
    .bind(timestamp())
    .run();
  await env.DB.prepare(
    "INSERT INTO github_oauth_states(state_hash,expires_at) VALUES(?,?)",
  )
    .bind(stateHash, new Date((issued + 600) * 1000).toISOString())
    .run();
  const signed = await signCookie(
    JSON.stringify({ state, verifier, issued }),
    env.SESSION_SIGNING_KEY,
  );
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.search = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: callback,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    allow_signup: "false",
  }).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Cache-Control": "no-store",
      "Set-Cookie": cookieHeader(OAUTH, signed, 600),
      "Referrer-Policy": "no-referrer",
    },
  });
}
async function callback(request: Request, env: Env) {
  const url = new URL(request.url),
    code = url.searchParams.get("code"),
    state = url.searchParams.get("state");
  const oauthCookie = cookieValue(request, OAUTH);
  const signed = await verifyCookie(oauthCookie, env.SESSION_SIGNING_KEY || "");
  const pending = validOAuthStateCookie(signed, state || "");
  let stateCookieFailure: string | null = null;
  if (!oauthCookie) stateCookieFailure = "oauth_cookie_missing";
  else if (!signed) stateCookieFailure = "oauth_cookie_signature_invalid";
  else if (!pending) {
    try {
      const payload = JSON.parse(signed) as {
        state?: unknown;
        verifier?: unknown;
        issued?: unknown;
      };
      const now = Math.floor(Date.now() / 1000);
      stateCookieFailure =
        typeof payload.state === "string" && payload.state !== state
          ? "oauth_state_mismatch"
          : typeof payload.verifier !== "string" ||
              !/^[A-Za-z0-9_-]{43,128}$/u.test(payload.verifier)
            ? "oauth_pkce_verifier_invalid"
            : typeof payload.issued !== "number" ||
                !Number.isFinite(payload.issued)
              ? "oauth_state_timestamp_invalid"
              : payload.issued > now + 30
                ? "oauth_state_issued_in_future"
                : payload.issued < now - 600
                  ? "oauth_state_expired"
                  : "oauth_state_payload_invalid";
    } catch {
      stateCookieFailure = "oauth_state_payload_invalid";
    }
  }
  const fail = (category: string, status?: number) => {
    // Keep runtime diagnostics categorical. Never log OAuth codes, cookies,
    // tokens, GitHub IDs, response bodies, or credential values.
    if (env.ENVIRONMENT === "staging")
      console.warn("admin_oauth_failure", {
        category,
        ...(status === undefined ? {} : { upstream_status: status }),
      });
    return new Response(
      "Authentication failed. Return to the administrator page and try again.",
      {
        status: 400,
        headers: { ...securePageHeaders, "Set-Cookie": clearCookie(OAUTH) },
      },
    );
  };
  if (
    !code ||
    code.length > 512 ||
    !state ||
    !pending ||
    !env.GITHUB_CLIENT_ID ||
    !env.GITHUB_CLIENT_SECRET ||
    !env.GITHUB_CALLBACK_URL ||
    !env.SESSION_SIGNING_KEY ||
    env.SESSION_SIGNING_KEY.length < 32 ||
    !env.GITHUB_ALLOWED_USER_IDS
  )
    return fail(
      !code || !state
        ? "callback_parameters_missing"
        : stateCookieFailure
          ? stateCookieFailure
          : "auth_configuration_missing",
    );
  const callbackUrl = new URL(env.GITHUB_CALLBACK_URL);
  if (
    `${url.origin}${url.pathname}` !==
      `${callbackUrl.origin}${callbackUrl.pathname}` ||
    callbackUrl.protocol !== "https:"
  )
    return fail("callback_url_mismatch");
  const stateHash = await stateDigest(state);
  const consumed = await env.DB.prepare(
    "DELETE FROM github_oauth_states WHERE state_hash=? AND expires_at>? RETURNING state_hash",
  )
    .bind(stateHash, timestamp())
    .first<{ state_hash: string }>();
  if (!consumed) return fail("oauth_state_not_found_or_expired");
  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Thar-Textiles-Staging-Admin",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_CALLBACK_URL,
          code_verifier: pending.verifier,
        }),
      },
    );
    if (!tokenResponse.ok)
      return fail("token_exchange_rejected", tokenResponse.status);
    const tokenData = (await tokenResponse.json()) as {
      access_token?: unknown;
      error?: unknown;
    };
    if (
      typeof tokenData.access_token !== "string" ||
      tokenData.access_token.length > 512
    )
      return fail(
        typeof tokenData.error === "string"
          ? "token_exchange_oauth_error"
          : "token_response_invalid",
      );
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Thar-Textiles-Staging-Admin",
      },
    });
    if (!profileResponse.ok)
      return fail("profile_request_rejected", profileResponse.status);
    const profile = (await profileResponse.json()) as { id?: unknown };
    if (!allowedGithubId(profile.id, env.GITHUB_ALLOWED_USER_IDS))
      return fail("github_identity_not_allowlisted");
    const uid = profile.id as number,
      iat = Math.floor(Date.now() / 1000),
      exp = iat + 1800;
    const session = await signCookie(
      JSON.stringify({ uid, iat, exp }),
      env.SESSION_SIGNING_KEY,
    );
    await audit(env, uid, "login", null, crypto.randomUUID());
    const headers = new Headers({
      Location: "/admin",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    });
    headers.append("Set-Cookie", cookieHeader(SESSION, session, 1800));
    headers.append("Set-Cookie", clearCookie(OAUTH));
    return new Response(null, { status: 302, headers });
  } catch {
    return fail("callback_processing_error");
  }
}
async function authenticated(request: Request, env: Env) {
  const value = await verifyCookie(
    cookieValue(request, SESSION),
    env.SESSION_SIGNING_KEY || "",
  );
  return validSession(value, env.GITHUB_ALLOWED_USER_IDS);
}
async function handleAdminApi(
  request: Request,
  env: Env,
  url: URL,
  requestId: string,
  userId: number,
) {
  const parts = url.pathname.split("/").filter(Boolean);
  if (
    request.method !== "GET" &&
    (request.headers.get("Origin") !== url.origin ||
      request.headers.get("Sec-Fetch-Site") === "cross-site")
  )
    return json({ error: "origin_not_allowed" }, 403);
  try {
    if (
      parts.length === 2 &&
      parts[1] === "enquiries" &&
      request.method === "GET"
    ) {
      const status = url.searchParams.get("status") || null,
        kind = url.searchParams.get("kind") || null,
        q = url.searchParams.get("q")?.slice(0, 100) || "",
        limit = Math.min(
          100,
          Math.max(1, Number(url.searchParams.get("limit") || 30)),
        );
      const rows = await env.DB.prepare(
        "SELECT id,reference,kind,status,name,email,phone,subject,created_at,updated_at FROM enquiries WHERE (? IS NULL OR status=?) AND (? IS NULL OR kind=?) AND (reference LIKE ? OR name LIKE ? OR email LIKE ?) ORDER BY created_at DESC LIMIT ?",
      )
        .bind(status, status, kind, kind, `%${q}%`, `%${q}%`, `%${q}%`, limit)
        .all();
      await audit(env, userId, "list", null, requestId);
      return json({ items: rows.results });
    }
    if (
      parts.length === 3 &&
      parts[1] === "enquiries" &&
      request.method === "GET"
    ) {
      const record = await env.DB.prepare(
        "SELECT * FROM enquiries WHERE id=? OR reference=?",
      )
        .bind(parts[2], parts[2])
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
      await audit(env, userId, "read", String(record.id), requestId);
      return json({
        record,
        events: events.results,
        notes: notes.results,
        notifications: notifications.results,
      });
    }
    if (
      parts.length === 4 &&
      parts[1] === "enquiries" &&
      parts[3] === "status" &&
      request.method === "PATCH"
    ) {
      const body = (await request.json()) as { status?: Status };
      if (!statuses.includes(body.status as Status))
        return json({ error: "invalid_status" }, 400);
      const record = await env.DB.prepare(
        "SELECT id,status FROM enquiries WHERE id=?",
      )
        .bind(parts[2])
        .first<{ id: string; status: Status }>();
      if (!record) return json({ error: "not_found" }, 404);
      if (record.status !== body.status) {
        const at = timestamp();
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE enquiries SET status=?,updated_at=? WHERE id=?",
          ).bind(body.status, at, record.id),
          env.DB.prepare(
            "INSERT INTO status_events(id,enquiry_id,old_status,new_status,actor,created_at) VALUES(?,?,?,?,?,?)",
          ).bind(
            crypto.randomUUID(),
            record.id,
            record.status,
            body.status,
            actor(userId),
            at,
          ),
        ]);
      }
      await audit(env, userId, "status", record.id, requestId);
      return json({ status: body.status });
    }
    if (
      parts.length === 4 &&
      parts[1] === "enquiries" &&
      parts[3] === "notes" &&
      request.method === "POST"
    ) {
      const body = (await request.json()) as { body?: string };
      const note = body.body?.trim();
      if (!note || note.length > 2000)
        return json({ error: "invalid_note" }, 400);
      const record = await env.DB.prepare("SELECT id FROM enquiries WHERE id=?")
        .bind(parts[2])
        .first();
      if (!record) return json({ error: "not_found" }, 404);
      await env.DB.prepare(
        "INSERT INTO internal_notes(id,enquiry_id,author,body,created_at) VALUES(?,?,?,?,?)",
      )
        .bind(crypto.randomUUID(), parts[2], actor(userId), note, timestamp())
        .run();
      await audit(env, userId, "note", parts[2], requestId);
      return json({ saved: true }, 201);
    }
    if (parts[1] === "export" && request.method === "GET") {
      const since = url.searchParams.get("since"),
        until = url.searchParams.get("until");
      if (
        !since ||
        !until ||
        !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u.test(since) ||
        !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u.test(until) ||
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
        ],
        csv = [
          cols.join(","),
          ...rows.results.map((row) =>
            cols.map((col) => safeCsv(row[col])).join(","),
          ),
        ].join("\r\n");
      await audit(env, userId, "export", `${since}:${until}`, requestId);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=enquiries.csv",
          "Cache-Control": "no-store",
        },
      });
    }
    if (parts[1] === "outbox" && request.method === "GET") {
      const rows = await env.DB.prepare(
        "SELECT id,enquiry_id,event_type,state,attempts,next_attempt_at,last_error FROM notification_outbox ORDER BY created_at DESC LIMIT 100",
      ).all();
      await audit(env, userId, "outbox", null, requestId);
      return json({ items: rows.results });
    }
    return json({ error: "not_found" }, 404);
  } catch {
    return json({ error: "temporarily_unavailable", requestId }, 500);
  }
}
const adminWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url),
      requestId = crypto.randomUUID();
    if (url.pathname === "/auth/login" && request.method === "GET")
      return startLogin(request, env);
    if (url.pathname === "/auth/callback" && request.method === "GET")
      return callback(request, env);
    if (url.pathname === "/auth/logout" && request.method === "POST") {
      const user = await authenticated(request, env);
      if (!user) return json({ error: "unauthorized" }, 401);
      if (request.headers.get("Origin") !== url.origin)
        return json({ error: "origin_not_allowed" }, 403);
      await audit(env, user.id, "logout", null, requestId);
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/",
          "Set-Cookie": clearCookie(SESSION),
          "Cache-Control": "no-store",
        },
      });
    }
    if (url.pathname === "/auth/session" && request.method === "GET") {
      const user = await authenticated(request, env);
      return user
        ? json({ authenticated: true, id: user.id })
        : json({ authenticated: false }, 401);
    }
    if (
      url.pathname === "/" ||
      url.pathname === "/admin" ||
      url.pathname === "/admin/"
    ) {
      const user = await authenticated(request, env);
      if (!user)
        return new Response(
          '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thar Textiles Admin</title><main style="font:16px system-ui;max-width:38rem;margin:15vh auto;padding:1rem"><h1>Private administrator access</h1><p>Sign in with an approved GitHub account to review staging enquiries.</p><a href="/auth/login">Continue with GitHub</a></main>',
          { status: 200, headers: securePageHeaders },
        );
      return new Response(adminPage, { headers: securePageHeaders });
    }
    if (url.pathname.startsWith("/admin/")) {
      const user = await authenticated(request, env);
      if (!user) return json({ error: "unauthorized" }, 401);
      return handleAdminApi(request, env, url, requestId, user.id);
    }
    return json({ error: "not_found" }, 404);
  },
  async scheduled(_event: unknown, env: Env) {
    await env.DB.prepare("DELETE FROM github_oauth_states WHERE expires_at<?")
      .bind(timestamp())
      .run();
  },
};
export default adminWorker;
