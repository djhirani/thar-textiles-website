export const kinds = [
  "wholesale",
  "artisan",
  "partnership",
  "expert",
  "general",
] as const;
export type Kind = (typeof kinds)[number];
export const statuses = ["new", "pending", "contacted", "completed"] as const;
export type Status = (typeof statuses)[number];
export type Enquiry = {
  kind: Kind;
  name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  location: string | null;
  subject: string | null;
  message: string;
  productSlug: string | null;
  preferredLanguage: "en" | "ur" | "sd";
  preferredChannel: "email" | "phone";
  consent: true;
  sourceUrl: string | null;
  turnstileToken: string;
  website: "";
};
const keys = new Set([
  "kind",
  "name",
  "email",
  "phone",
  "organization",
  "location",
  "subject",
  "message",
  "productSlug",
  "preferredLanguage",
  "preferredChannel",
  "consent",
  "sourceUrl",
  "turnstileToken",
  "website",
]);
function field(value: unknown, max: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (
    typeof value !== "string" ||
    value.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)
  )
    throw new Error("invalid_field");
  const clean = value.trim().replace(/\s+/gu, " ");
  return clean || null;
}
export function validateEnquiry(raw: unknown): Enquiry {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("invalid_body");
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).some((key) => !keys.has(key)))
    throw new Error("unknown_field");
  const kind = v.kind;
  if (!kinds.includes(kind as Kind)) throw new Error("invalid_kind");
  const name = field(v.name, 120);
  const email = field(v.email, 254);
  const phone = field(v.phone, 32);
  const organization = field(v.organization, 160);
  const location = field(v.location, 120);
  const subject = field(v.subject, 160);
  const message = field(v.message, 3000);
  const productSlug = field(v.productSlug, 120);
  const sourceUrl = field(v.sourceUrl, 300);
  const turnstileToken = field(v.turnstileToken, 2048);
  const website = field(v.website, 200);
  if (
    !name ||
    name.length < 2 ||
    !message ||
    message.length < 10 ||
    !turnstileToken
  )
    throw new Error("required_field");
  if (!email && !phone) throw new Error("contact_required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
    throw new Error("invalid_email");
  if (
    phone &&
    (!/^\+?[\d\s().-]{6,32}$/u.test(phone) ||
      phone.replace(/\D/gu, "").length < 6)
  )
    throw new Error("invalid_phone");
  if (website) throw new Error("invalid_request");
  if (v.consent !== true) throw new Error("consent_required");
  if (!["en", "ur", "sd"].includes(String(v.preferredLanguage)))
    throw new Error("invalid_language");
  if (!["email", "phone"].includes(String(v.preferredChannel)))
    throw new Error("invalid_channel");
  if (
    (v.preferredChannel === "email" && !email) ||
    (v.preferredChannel === "phone" && !phone)
  )
    throw new Error("preferred_contact_required");
  if (kind === "wholesale" && !subject && !productSlug)
    throw new Error("product_or_subject_required");
  if (kind === "artisan" && (!location || !subject))
    throw new Error("artisan_details_required");
  if (kind === "partnership" && !organization)
    throw new Error("organization_required");
  if (kind === "expert" && !subject) throw new Error("expertise_required");
  if (sourceUrl && !/^https?:\/\//u.test(sourceUrl))
    throw new Error("invalid_source");
  if (productSlug && !/^[a-z0-9-]+$/u.test(productSlug))
    throw new Error("invalid_product");
  return {
    kind: kind as Kind,
    name,
    email,
    phone,
    organization,
    location,
    subject,
    message,
    productSlug,
    preferredLanguage: v.preferredLanguage as Enquiry["preferredLanguage"],
    preferredChannel: v.preferredChannel as Enquiry["preferredChannel"],
    consent: true,
    sourceUrl,
    turnstileToken,
    website: "",
  };
}
