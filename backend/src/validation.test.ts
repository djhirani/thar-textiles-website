import { describe, expect, it } from "vitest";
import { validateEnquiry } from "./validation";

const base = {
  kind: "general",
  name: "Amina Ali",
  email: "amina@example.org",
  phone: "",
  organization: "",
  location: "",
  subject: "",
  message: "Please contact me about the collection.",
  productSlug: "",
  preferredLanguage: "en",
  preferredChannel: "email",
  consent: true,
  sourceUrl: "https://example.org/contact/",
  website: "",
  turnstileToken: "test-token",
};
describe("enquiry validation", () => {
  it("accepts Unicode contact details and normalizes whitespace", () => {
    expect(
      validateEnquiry({
        ...base,
        name: "  عائشہ  خان ",
        message: "  Please   contact   me about this. ",
      }).name,
    ).toBe("عائشہ خان");
  });
  it("requires an explicit consent and a return channel", () => {
    expect(() => validateEnquiry({ ...base, consent: false })).toThrow(
      "consent_required",
    );
    expect(() => validateEnquiry({ ...base, email: "", phone: "" })).toThrow(
      "contact_required",
    );
  });
  it("rejects unknown fields, control characters, malformed mail/phone, and the honeypot", () => {
    expect(() => validateEnquiry({ ...base, privateThing: "x" })).toThrow(
      "unknown_field",
    );
    expect(() => validateEnquiry({ ...base, name: "A\u0000B" })).toThrow(
      "invalid_field",
    );
    expect(() => validateEnquiry({ ...base, email: "nope" })).toThrow(
      "invalid_email",
    );
    expect(() =>
      validateEnquiry({
        ...base,
        email: "",
        phone: "......",
        preferredChannel: "phone",
      }),
    ).toThrow("invalid_phone");
    expect(() => validateEnquiry({ ...base, website: "spam" })).toThrow(
      "invalid_request",
    );
  });
  it("enforces category-specific minimums without adding unverified capacity claims", () => {
    expect(() => validateEnquiry({ ...base, kind: "artisan" })).toThrow(
      "artisan_details_required",
    );
    expect(() => validateEnquiry({ ...base, kind: "partnership" })).toThrow(
      "organization_required",
    );
  });
  it("accepts all five enquiry workflows with their required fields", () => {
    const cases = [
      { kind: "wholesale", subject: "Embroidered textile" },
      { kind: "artisan", location: "Mithi district", subject: "Embroidery" },
      { kind: "partnership", organization: "Community organization" },
      { kind: "expert", subject: "Textile design" },
      { kind: "general" },
    ];
    for (const fields of cases)
      expect(validateEnquiry({ ...base, ...fields }).kind).toBe(fields.kind);
  });
});
