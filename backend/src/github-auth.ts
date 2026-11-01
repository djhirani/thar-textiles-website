const encoder = new TextEncoder();
const decoder = new TextDecoder();
const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/=+$/u, "");
const fromB64url = (value: string) =>
  Uint8Array.from(atob(value.replace(/-/gu, "+").replace(/_/gu, "/")), (c) =>
    c.charCodeAt(0),
  );
const randomToken = (bytes = 32) => {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return b64url(value);
};
const hex = (value: Uint8Array) =>
  [...value].map((byte) => byte.toString(16).padStart(2, "0")).join("");

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
export async function signCookie(value: string, secret: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(value),
  );
  return `${b64url(encoder.encode(value))}.${b64url(new Uint8Array(signature))}`;
}
export async function verifyCookie(cookie: string | null, secret: string) {
  if (!cookie || !secret || cookie.length > 2048) return null;
  const [body, signature, ...extra] = cookie.split(".");
  if (!body || !signature || extra.length) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromB64url(signature),
      fromB64url(body),
    );
    return valid ? decoder.decode(fromB64url(body)) : null;
  } catch {
    return null;
  }
}
export function cookieValue(request: Request, name: string) {
  const header = request.headers.get("Cookie") || "";
  for (const pair of header.split(";")) {
    const index = pair.indexOf("=");
    if (index > 0 && pair.slice(0, index).trim() === name)
      return pair.slice(index + 1).trim();
  }
  return null;
}
export function cookieHeader(name: string, value: string, maxAge: number) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}
export async function pkcePair() {
  const verifier = randomToken(32);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(verifier),
  );
  return { verifier, challenge: b64url(new Uint8Array(digest)) };
}
export function allowedGithubId(
  userId: unknown,
  allowlist: string | undefined,
) {
  if (
    typeof userId !== "number" ||
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    !allowlist
  )
    return false;
  const allowed = new Set(
    allowlist
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^[1-9]\d{0,19}$/u.test(id)),
  );
  return allowed.has(String(userId));
}
export function validOAuthStateCookie(
  value: string | null,
  expectedState: string,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as {
      state?: unknown;
      verifier?: unknown;
      issued?: unknown;
    };
    if (
      typeof parsed.state !== "string" ||
      parsed.state.length < 32 ||
      parsed.state !== expectedState ||
      typeof parsed.verifier !== "string" ||
      !/^[A-Za-z0-9_-]{43,128}$/u.test(parsed.verifier) ||
      typeof parsed.issued !== "number" ||
      !Number.isFinite(parsed.issued) ||
      parsed.issued > nowSeconds + 30 ||
      parsed.issued < nowSeconds - 600
    )
      return null;
    return {
      verifier: parsed.verifier,
      state: parsed.state,
      issued: parsed.issued,
    };
  } catch {
    return null;
  }
}
export function validSession(
  value: string | null,
  allowedIds: string | undefined,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (!value || value.length > 512) return null;
  try {
    const parsed = JSON.parse(value) as {
      uid?: unknown;
      exp?: unknown;
      iat?: unknown;
    };
    if (
      typeof parsed.uid !== "number" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.iat !== "number" ||
      !Number.isSafeInteger(parsed.uid) ||
      parsed.exp <= nowSeconds ||
      parsed.exp - parsed.iat > 1800 ||
      parsed.iat > nowSeconds + 30 ||
      !allowedGithubId(parsed.uid, allowedIds)
    )
      return null;
    return { id: parsed.uid, expiresAt: parsed.exp };
  } catch {
    return null;
  }
}
export async function stateDigest(value: string) {
  return hex(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", encoder.encode(value)),
    ),
  );
}
export { randomToken };
