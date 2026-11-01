import { describe, expect, it } from "vitest";
import { accessIdentity } from "./index";

describe("Cloudflare Access identity claims", () => {
  const now = 1_800_000_000;

  it("accepts an unexpired Access application identity and normalizes its email", () => {
    expect(
      accessIdentity(
        { type: "app", email: " Staff@Example.org ", exp: now + 60 },
        now,
      ),
    ).toBe("staff@example.org");
  });

  it("rejects tokens without an expiry or with an expired expiry", () => {
    expect(
      accessIdentity({ type: "app", email: "staff@example.org" }, now),
    ).toBeNull();
    expect(
      accessIdentity(
        { type: "app", email: "staff@example.org", exp: now },
        now,
      ),
    ).toBeNull();
    expect(
      accessIdentity(
        { type: "app", email: "staff@example.org", exp: Number.NaN },
        now,
      ),
    ).toBeNull();
  });

  it("rejects service tokens and missing or malformed user identities", () => {
    expect(
      accessIdentity(
        { type: "app", common_name: "service-token", exp: now + 60 },
        now,
      ),
    ).toBeNull();
    expect(
      accessIdentity(
        { type: "org", email: "staff@example.org", exp: now + 60 },
        now,
      ),
    ).toBeNull();
    expect(
      accessIdentity({ type: "app", email: "   ", exp: now + 60 }, now),
    ).toBeNull();
    expect(
      accessIdentity(
        { type: "app", email: `${"x".repeat(250)}@example.org`, exp: now + 60 },
        now,
      ),
    ).toBeNull();
  });
});
