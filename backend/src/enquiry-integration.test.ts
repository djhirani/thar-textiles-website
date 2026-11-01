// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import type { D1Database } from "@cloudflare/workers-types";
import publicWorker from "./public-api";
import adminWorker from "./admin";
import { signCookie } from "./github-auth";

// Actual SQLite and the existing migrations; this adapter is local test-only.
let sqlite: DatabaseSync;
const db = {
  prepare(sql: string) {
    let values: SQLInputValue[] = [];
    const statement = {
      bind(...args: SQLInputValue[]) {
        values = args;
        return statement;
      },
      async run() {
        sqlite.prepare(sql).run(...values);
        return { success: true };
      },
      async first() {
        return sqlite.prepare(sql).get(...values) ?? null;
      },
      async all() {
        return { results: sqlite.prepare(sql).all(...values) };
      },
    };
    return statement;
  },
  async batch(statements: { run(): Promise<unknown> }[]) {
    sqlite.exec("BEGIN");
    try {
      const result = [];
      for (const statement of statements) result.push(await statement.run());
      sqlite.exec("COMMIT");
      return result;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  },
} as unknown as D1Database;
const env = {
  DB: db,
  ENVIRONMENT: "local",
  ALLOWED_ORIGINS: "http://localhost:3000",
  CONSENT_VERSION: "synthetic-test",
  RATE_LIMIT_SALT: "test-only-salt",
};
const adminEnv = {
  DB: db,
  ENVIRONMENT: "local",
  GITHUB_ALLOWED_USER_IDS: "123",
  SESSION_SIGNING_KEY: "test-only-session-key-at-least-32-characters",
};
const payload = (kind = "general") => ({
  kind,
  name: `Synthetic ${kind}`,
  email: "synthetic@example.org",
  phone: "",
  organization: "Synthetic organisation",
  location: "Synthetic location",
  subject: "Synthetic textile enquiry",
  message: "Synthetic enquiry integration test only.",
  productSlug: "",
  preferredLanguage: "en",
  preferredChannel: "email",
  consent: true,
  sourceUrl: "http://localhost:3000/contact/",
  website: "",
  turnstileToken: "local-test",
});
function submit(body = payload(), key = crypto.randomUUID()) {
  return publicWorker.fetch(
    new Request("http://localhost:8787/v1/enquiries", {
      method: "POST",
      headers: {
        Origin: "http://localhost:3000",
        "Content-Type": "application/json",
        "Idempotency-Key": key,
        "CF-Connecting-IP": "192.0.2.10",
      },
      body: JSON.stringify(body),
    }),
    env,
  );
}
async function admin(
  path: string,
  method = "GET",
  body?: unknown,
  origin = "https://admin.example.org",
) {
  const cookie = await signCookie(
    JSON.stringify({
      uid: 123,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 1800,
    }),
    adminEnv.SESSION_SIGNING_KEY,
  );
  return adminWorker.fetch(
    new Request(`https://admin.example.org${path}`, {
      method,
      headers: {
        Cookie: `__Host-tt_session=${cookie}`,
        Origin: origin,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    adminEnv,
  );
}
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:");
  for (const file of readdirSync("backend/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    sqlite.exec(readFileSync(`backend/migrations/${file}`, "utf8"));
});
afterEach(() => sqlite.close());
describe("enquiry persistence and administrative workflow (local SQLite)", () => {
  it("persists all five kinds with unique references, notes, status history, audit and queued notifications", async () => {
    const references = new Set();
    for (const kind of [
      "wholesale",
      "artisan",
      "partnership",
      "expert",
      "general",
    ]) {
      const response = await submit(payload(kind));
      expect(response.status).toBe(201);
      const { reference } = await response.json();
      references.add(reference);
      const detail = await (
        await admin(`/admin/enquiries/${reference}`)
      ).json();
      expect(detail.record.kind).toBe(kind);
      expect(detail.notifications).toHaveLength(2);
      expect(
        detail.notifications.every(
          (n: { state: string }) => n.state === "pending",
        ),
      ).toBe(true);
      const id = detail.record.id;
      expect(
        (
          await admin(`/admin/enquiries/${id}/status`, "PATCH", {
            status: "pending",
          })
        ).status,
      ).toBe(200);
      expect(
        (
          await admin(`/admin/enquiries/${id}/notes`, "POST", {
            body: "Synthetic private follow-up",
          })
        ).status,
      ).toBe(201);
      const changed = await (await admin(`/admin/enquiries/${id}`)).json();
      expect(changed.record.status).toBe("pending");
      expect(changed.events).toHaveLength(2);
      expect(changed.notes[0].body).toBe("Synthetic private follow-up");
      expect(
        sqlite
          .prepare(
            "SELECT count(*) n FROM audit_events WHERE target=? AND action IN ('status','note')",
          )
          .get(id)?.n,
      ).toBe(2);
    }
    expect(references.size).toBe(5);
    expect(
      (
        await (
          await admin("/admin/enquiries?kind=expert&status=pending&q=Synthetic")
        ).json()
      ).items,
    ).toHaveLength(1);
    const date = new Date().toISOString().slice(0, 10);
    const csv = await admin(`/admin/export?since=${date}&until=${date}`);
    expect(csv.status).toBe(200);
    expect((await csv.text()).split("\r\n")).toHaveLength(6);
  });
  it("retries return the original reference without duplicating records or notifications; changed content conflicts", async () => {
    const key = crypto.randomUUID();
    const first = await (await submit(payload(), key)).json();
    const retry = await submit(payload(), key);
    expect(retry.status).toBe(200);
    expect(await retry.json()).toMatchObject({
      reference: first.reference,
      duplicate: true,
    });
    expect(
      (
        await submit(
          { ...payload(), message: "Changed synthetic content" },
          key,
        )
      ).status,
    ).toBe(409);
    expect(sqlite.prepare("SELECT count(*) n FROM enquiries").get()?.n).toBe(1);
    expect(
      sqlite.prepare("SELECT count(*) n FROM notification_outbox").get()?.n,
    ).toBe(2);
  });
  it("retains unexpired rate counters and blocks request 21, including legacy SQLite timestamps", async () => {
    for (let i = 0; i < 20; i++)
      expect(
        (await submit({ ...payload(), turnstileToken: "invalid" })).status,
      ).toBe(403);
    expect((await submit()).status).toBe(429);
    sqlite.exec("UPDATE rate_limits SET expires_at=datetime('now','+1 hour')");
    expect((await submit()).status).toBe(429);
    sqlite.exec("UPDATE rate_limits SET expires_at=datetime('now','-1 hour')");
    expect((await submit()).status).toBe(201);
  });
  it("rejects public retrieval, unauthenticated admin, foreign mutation origins and invalid consent", async () => {
    expect(
      (
        await publicWorker.fetch(
          new Request("http://localhost:8787/admin/enquiries"),
          env,
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await adminWorker.fetch(
          new Request("https://admin.example.org/admin/enquiries"),
          adminEnv,
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await admin(
          "/admin/enquiries/id/status",
          "PATCH",
          { status: "pending" },
          "https://evil.example",
        )
      ).status,
    ).toBe(403);
    expect((await submit({ ...payload(), consent: false })).status).toBe(400);
  });
});
