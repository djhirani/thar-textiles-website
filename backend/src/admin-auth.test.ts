import { describe, expect, it } from "vitest";
import admin from "./admin";
import publicApi from "./public-api";
import { signCookie } from "./github-auth";

const db = {
  prepare: () => ({
    bind: () => ({
      run: async () => ({ meta: { changes: 1 } }),
      first: async () => null,
      all: async () => ({ results: [] }),
    }),
  }),
  batch: async () => [],
} as never;
const env = {
  DB: db,
  ENVIRONMENT: "staging",
  GITHUB_ALLOWED_USER_IDS: "12345",
  SESSION_SIGNING_KEY: "long-local-test-signing-key",
} as never;

describe("staging Worker security boundaries", () => {
  it("fails closed on admin records, exports, notes, and session endpoints", async () => {
    for (const path of [
      "/admin/enquiries",
      "/admin/export?since=2026-01-01&until=2026-01-01",
      "/admin/enquiries/1/notes",
      "/auth/session",
    ]) {
      const response = await admin.fetch(
        new Request(`https://admin.example${path}`, {
          method: path.endsWith("notes") ? "POST" : "GET",
        }),
        env,
      );
      expect(response.status).toBe(401);
    }
  });
  it("rejects forged OAuth callbacks and unknown callback parameters", async () => {
    const response = await admin.fetch(
      new Request(
        "https://admin.example/auth/callback?code=forged&state=wrong",
      ),
      env,
    );
    expect(response.status).toBe(400);
    expect(await response.text()).toContain("Authentication failed");
  });
  it("rejects a valid GitHub callback from an account outside the approved numeric IDs", async () => {
    const stateDb = {
      prepare: (sql: string) => ({
        bind: () => ({
          run: async () => ({ meta: { changes: 1 } }),
          first: async () =>
            sql.startsWith("DELETE FROM github_oauth_states")
              ? { state_hash: "consumed" }
              : null,
        }),
      }),
    } as never;
    const authEnv = {
      DB: stateDb,
      ENVIRONMENT: "staging",
      GITHUB_CLIENT_ID: "public-client-id",
      GITHUB_CLIENT_SECRET: "test-client-secret",
      GITHUB_CALLBACK_URL: "https://admin.example/auth/callback",
      GITHUB_ALLOWED_USER_IDS: "12345",
      SESSION_SIGNING_KEY:
        "test-only-signing-key-with-more-than-thirty-two-characters",
    } as never;
    const login = await admin.fetch(
      new Request("https://admin.example/auth/login"),
      authEnv,
    );
    expect(login.status).toBe(302);
    const authorizeUrl = new URL(login.headers.get("Location")!);
    expect(authorizeUrl.searchParams.get("scope")).toBeNull();
    expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe("S256");
    const cookie = login.headers.get("Set-Cookie")!.split(";")[0];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL) =>
      String(input).includes("/access_token")
        ? Response.json({ access_token: "ephemeral-test-token" })
        : Response.json({ id: 54321 });
    try {
      const callback = await admin.fetch(
        new Request(
          `https://admin.example/auth/callback?code=synthetic-code&state=${authorizeUrl.searchParams.get("state")}`,
          { headers: { Cookie: cookie } },
        ),
        authEnv,
      );
      expect(callback.status).toBe(400);
      expect(callback.headers.get("Set-Cookie")).toContain("Max-Age=0");
      expect(await callback.text()).not.toContain("ephemeral-test-token");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
  it("completes an approved GitHub login and grants only a short-lived host session", async () => {
    const stateDb = {
      prepare: (sql: string) => ({
        bind: () => ({
          run: async () => ({ meta: { changes: 1 } }),
          first: async () =>
            sql.startsWith("DELETE FROM github_oauth_states")
              ? { state_hash: "consumed" }
              : null,
          all: async () => ({ results: [] }),
        }),
      }),
    } as never;
    const authEnv = {
      DB: stateDb,
      ENVIRONMENT: "staging",
      GITHUB_CLIENT_ID: "public-client-id",
      GITHUB_CLIENT_SECRET: "test-client-secret",
      GITHUB_CALLBACK_URL: "https://admin.example/auth/callback",
      GITHUB_ALLOWED_USER_IDS: "12345",
      SESSION_SIGNING_KEY:
        "test-only-signing-key-with-more-than-thirty-two-characters",
    } as never;
    const login = await admin.fetch(
      new Request("https://admin.example/auth/login"),
      authEnv,
    );
    const authorizeUrl = new URL(login.headers.get("Location")!);
    const cookie = login.headers.get("Set-Cookie")!.split(";")[0];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL) =>
      String(input).includes("/access_token")
        ? Response.json({ access_token: "ephemeral-test-token" })
        : Response.json({ id: 12345 });
    try {
      const response = await admin.fetch(
        new Request(
          `https://admin.example/auth/callback?code=synthetic-code&state=${authorizeUrl.searchParams.get("state")}`,
          { headers: { Cookie: cookie } },
        ),
        authEnv,
      );
      expect(response.status).toBe(302);
      const setCookies = response.headers.get("Set-Cookie") || "";
      expect(setCookies).toContain("__Host-tt_session=");
      expect(setCookies).toContain("HttpOnly; Secure; SameSite=Lax");
      expect(setCookies).toContain("Max-Age=1800");
      expect(setCookies).not.toContain("ephemeral-test-token");
      const session = setCookies.match(/__Host-tt_session=([^;,]+)/u)?.[1];
      expect(session).toBeTruthy();
      const check = await admin.fetch(
        new Request("https://admin.example/auth/session", {
          headers: { Cookie: `__Host-tt_session=${session}` },
        }),
        authEnv,
      );
      expect(check.status).toBe(200);
      expect(await check.json()).toEqual({ authenticated: true, id: 12345 });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
  it("does not expose admin routes through the public intake Worker", async () => {
    const response = await publicApi.fetch(
      new Request("https://api.example/admin/enquiries"),
      {
        DB: db,
        ENVIRONMENT: "staging",
        ALLOWED_ORIGINS: "http://localhost:3000",
        CONSENT_VERSION: "test",
      } as never,
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  });
  it("rejects expired sessions and accounts outside the approved ID list", async () => {
    const key = "test-only-signing-key-with-more-than-thirty-two-characters";
    for (const value of [
      await signCookie(
        JSON.stringify({ uid: 12345, iat: 1000, exp: 1001 }),
        key,
      ),
      await signCookie(
        JSON.stringify({
          uid: 54321,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 300,
        }),
        key,
      ),
    ]) {
      const response = await admin.fetch(
        new Request("https://admin.example/admin/enquiries", {
          headers: { Cookie: `__Host-tt_session=${value}` },
        }),
        env,
      );
      expect(response.status).toBe(401);
    }
  });
});
