// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { CookieJar } from "tough-cookie";
import { parseEnv } from "node:util";
import admin from "./admin";
import { allowedGithubId, signCookie, verifyCookie } from "./github-auth";

const origin = "https://admin.example";
const signingKey = "synthetic-cookie-roundtrip-signing-key-only";
const oauthCookieName = "__Host-tt_oauth";

function harness() {
  const states = new Map<string, string>();
  const DB = {
    prepare: (sql: string) => ({
      bind: (...values: string[]) => ({
        run: async () => {
          if (sql.startsWith("INSERT INTO github_oauth_states"))
            states.set(values[0], values[1]);
          else if (sql.startsWith("DELETE FROM github_oauth_states"))
            for (const [state, expiry] of states)
              if (expiry < values[0]) states.delete(state);
          return { meta: { changes: 1 } };
        },
        first: async () => {
          const expiry = states.get(values[0]);
          if (!expiry || expiry <= values[1]) return null;
          states.delete(values[0]);
          return { state_hash: values[0] };
        },
      }),
    }),
  };
  const env = {
    DB,
    ENVIRONMENT: "staging",
    GITHUB_CLIENT_ID: "synthetic-client-id",
    GITHUB_CLIENT_SECRET: "synthetic-client-secret",
    GITHUB_ALLOWED_USER_IDS: "12345",
    GITHUB_CALLBACK_URL: `${origin}/auth/callback`,
    SESSION_SIGNING_KEY: signingKey,
  };
  return {
    env,
    states,
    request: (path: string, cookie?: string) =>
      admin.fetch(
        new Request(`${origin}${path}`, {
          headers: cookie ? { Cookie: cookie } : undefined,
        }),
        env as never,
      ),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("OAuth state cookie redirect round trip", () => {
  it("removes dotenv syntax quotes before configuration and keeps the numeric allowlist strict", () => {
    const quotedSource = 'GITHUB_ALLOWED_USER_IDS="12345"';
    expect(allowedGithubId(12345, quotedSource.split("=")[1])).toBe(false);
    expect(
      allowedGithubId(12345, parseEnv(quotedSource).GITHUB_ALLOWED_USER_IDS),
    ).toBe(true);
  });
  it("accepts the login cookie on a cross-site top-level GET and establishes a verified session", async () => {
    const app = harness();
    const login = await app.request("/auth/login");
    expect(login.status).toBe(302);
    const header = login.headers.get("Set-Cookie")!;
    expect(header).toMatch(/^__Host-tt_oauth=/u);
    expect(header).toContain(
      "; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax",
    );
    expect(header).not.toMatch(/Domain=|SameSite=Strict|Max-Age=0/iu);

    const jar = new CookieJar(undefined, { prefixSecurity: "strict" });
    const stored = await jar.setCookie(header, `${origin}/auth/login`);
    expect(stored?.hostOnly).toBe(true);
    expect(stored?.httpOnly).toBe(true);
    expect(stored?.secure).toBe(true);
    // GitHub returns through a top-level cross-site GET, which permits Lax.
    const cookie = await jar.getCookieString(`${origin}/auth/callback`, {
      sameSiteContext: "lax",
    });
    expect(cookie).toMatch(/^__Host-tt_oauth=/u);
    const authorize = new URL(login.headers.get("Location")!);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        if (String(input) === "https://github.com/login/oauth/access_token") {
          const body = JSON.parse(String(init?.body));
          const digest = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(body.code_verifier),
          );
          expect(Buffer.from(digest).toString("base64url")).toBe(
            authorize.searchParams.get("code_challenge"),
          );
          expect(body.redirect_uri).toBe(app.env.GITHUB_CALLBACK_URL);
          return Response.json({ access_token: "synthetic-token" });
        }
        expect(String(input)).toBe("https://api.github.com/user");
        return Response.json({ id: 12345 });
      });
    const callbackPath = `/auth/callback?code=synthetic-code&state=${authorize.searchParams.get("state")}`;
    const callback = await app.request(callbackPath, cookie);
    expect(callback.status).toBe(302);
    expect(callback.headers.get("Location")).toBe("/admin");
    for (const item of callback.headers.getSetCookie())
      await jar.setCookie(item, `${origin}/auth/callback`);
    const sessionCookie = await jar.getCookieString(`${origin}/auth/session`);
    expect(sessionCookie).toContain("__Host-tt_session=");
    expect(sessionCookie).not.toContain(`${oauthCookieName}=`);
    expect((await app.request("/auth/session", sessionCookie)).status).toBe(
      200,
    );
    expect(app.states.size).toBe(0);
    // A replay is rejected by the one-time D1 state ledger before GitHub.
    expect((await app.request(callbackPath, cookie)).status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    "missing",
    "tampered",
    "wrong-key",
    "mismatched-state",
    "expired",
    "malformed",
  ])(
    "rejects %s state cookies before exchanging an authorization code",
    async (scenario) => {
      const app = harness();
      const login = await app.request("/auth/login");
      const authorize = new URL(login.headers.get("Location")!);
      let state = authorize.searchParams.get("state")!;
      let cookie = login.headers.get("Set-Cookie")!.split(";")[0];
      if (scenario === "missing") cookie = "";
      if (scenario === "tampered") cookie += "x";
      if (scenario === "wrong-key")
        app.env.SESSION_SIGNING_KEY = "different-synthetic-signing-key-only";
      if (scenario === "mismatched-state") state = "f".repeat(43);
      if (scenario === "expired") {
        const payload = JSON.parse(
          (await verifyCookie(cookie.split("=")[1], signingKey))!,
        );
        payload.issued = Math.floor(Date.now() / 1000) - 601;
        cookie = `${oauthCookieName}=${await signCookie(JSON.stringify(payload), signingKey)}`;
      }
      if (scenario === "malformed")
        cookie = `${oauthCookieName}=${await signCookie("{}", signingKey)}`;
      const fetchMock = vi.spyOn(globalThis, "fetch");
      const response = await app.request(
        `/auth/callback?code=synthetic-code&state=${state}`,
        cookie,
      );
      expect(response.status).toBe(400);
      expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
      expect(response.headers.get("Set-Cookie")).not.toContain(
        "__Host-tt_session=",
      );
      expect(fetchMock).not.toHaveBeenCalled();
      expect(app.states.size).toBe(1);
    },
  );
});
