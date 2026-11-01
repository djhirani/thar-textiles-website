import { describe, expect, it } from "vitest";
import {
  allowedGithubId,
  cookieHeader,
  pkcePair,
  signCookie,
  validOAuthStateCookie,
  validSession,
  verifyCookie,
} from "./github-auth";

describe("GitHub OAuth security primitives", () => {
  it("creates S256 PKCE values in the supported verifier range", async () => {
    const pair = await pkcePair();
    expect(pair.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(pair.challenge).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(pair.challenge).not.toBe(pair.verifier);
  });
  it("authenticates signed cookies and rejects tampering", async () => {
    const signed = await signCookie(
      '{"uid":101,"iat":1000,"exp":1500}',
      "test-signing-key",
    );
    expect(await verifyCookie(signed, "test-signing-key")).toContain(
      '"uid":101',
    );
    expect(await verifyCookie(`${signed}x`, "test-signing-key")).toBeNull();
    expect(await verifyCookie(signed, "other-key")).toBeNull();
  });
  it("checks session expiry, maximum lifetime, and numeric allowlist", () => {
    const allow = "12345, 98765";
    expect(
      validSession(
        JSON.stringify({ uid: 12345, iat: 1000, exp: 1500 }),
        allow,
        1200,
      )?.id,
    ).toBe(12345);
    expect(
      validSession(
        JSON.stringify({ uid: 12345, iat: 1000, exp: 1500 }),
        allow,
        1500,
      ),
    ).toBeNull();
    expect(
      validSession(
        JSON.stringify({ uid: 12345, iat: 1000, exp: 3001 }),
        allow,
        1200,
      ),
    ).toBeNull();
    expect(
      validSession(
        JSON.stringify({ uid: 99999, iat: 1000, exp: 1500 }),
        allow,
        1200,
      ),
    ).toBeNull();
    expect(allowedGithubId("12345", allow)).toBe(false);
    expect(allowedGithubId(12345, "")).toBe(false);
  });
  it("rejects forged, expired, and malformed OAuth state", () => {
    const item = {
      state: "s".repeat(43),
      verifier: "v".repeat(43),
      issued: 1000,
    };
    expect(
      validOAuthStateCookie(JSON.stringify(item), item.state, 1100)?.verifier,
    ).toBe(item.verifier);
    expect(
      validOAuthStateCookie(JSON.stringify(item), "f".repeat(43), 1100),
    ).toBeNull();
    expect(
      validOAuthStateCookie(JSON.stringify(item), item.state, 1601),
    ).toBeNull();
    expect(validOAuthStateCookie("{}", item.state, 1100)).toBeNull();
  });
  it("sets host-only Secure HttpOnly SameSite=Lax cookies with bounded age", () => {
    expect(cookieHeader("__Host-session", "signed", 1800)).toContain(
      "Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax",
    );
  });
});
