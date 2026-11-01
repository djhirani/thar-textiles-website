"use client";

import { LinkArrow } from "./link-arrow";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { verifiedBusiness } from "@/lib/content";
import Link from "next/link";
import { validateEnquiry } from "../../backend/src/validation";

const validationMessages: Record<string, string> = {
  contact_required:
    "Enter an email address or phone number so the team can reply.",
  preferred_contact_required:
    "Enter contact details for your selected reply channel: an email address for Email, or a phone number for Phone.",
  invalid_email: "Enter a valid email address, such as name@example.org.",
  invalid_phone:
    "Enter a valid phone number with at least six digits, including the country code where applicable.",
  required_field:
    "Enter your name and an enquiry message of at least 10 characters.",
  organization_required: "Enter your organization for a partnership enquiry.",
  artisan_details_required: "Enter your district or region and craft or skill.",
  expertise_required: "Enter your area of expertise.",
  product_or_subject_required: "Enter the product or topic for your enquiry.",
  consent_required: "Please agree to the privacy notice before submitting.",
  invalid_channel: "Choose Email or Phone as your preferred reply channel.",
  verification_failed:
    "Verification expired or failed. Please complete the check and retry.",
  rate_limited:
    "Too many attempts were made. Please wait one hour before retrying, or contact the team directly.",
};

type Kind = "wholesale" | "artisan" | "partnership" | "expert" | "general";
const labels: Record<Kind, string> = {
  wholesale: "Product or wholesale enquiry",
  artisan: "Artisan participation enquiry",
  partnership: "Partnership enquiry",
  expert: "Expert collaboration enquiry",
  general: "General enquiry",
};
const subscribe = () => () => {};
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (id: string) => void;
    };
  }
}
export function EnquiryForm({
  kind,
  productSlug,
  productTitle,
}: {
  kind: Kind;
  productSlug?: string;
  productTitle?: string;
}) {
  const api = process.env.NEXT_PUBLIC_ENQUIRY_API_URL;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "success">("idle");
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [key, setKey] = useState("");
  const [replyChannel, setReplyChannel] = useState("");
  useEffect(() => {
    if (!api || !siteKey || !widget.current) return;
    const render = () => {
      if (widget.current && window.turnstile && !widgetId.current)
        widgetId.current = window.turnstile.render(widget.current, {
          sitekey: siteKey,
          action: "enquiry",
          callback: setToken,
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
    };
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    document.head.append(script);
    return () => {
      script.remove();
    };
  }, [api, siteKey]);
  const isLocal =
    process.env.NODE_ENV === "development" &&
    !siteKey &&
    !!api &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/u.test(api) &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const verification = token || (isLocal ? "local-test" : "");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!api || !verification || state === "sending") return;
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) || "").trim();
    const body = {
      kind,
      name: value("name"),
      email: value("email"),
      phone: value("phone"),
      organization: value("organization"),
      location: value("location"),
      subject: productTitle || value("subject"),
      message: value("message"),
      productSlug: productSlug || "",
      preferredLanguage: value("preferredLanguage") || "en",
      preferredChannel: value("preferredChannel"),
      consent: data.get("consent") === "on",
      sourceUrl: `${window.location.origin}${window.location.pathname}`,
      website: value("website"),
      turnstileToken: verification,
    };
    try {
      validateEnquiry(body);
    } catch (error) {
      setMessage(
        validationMessages[error instanceof Error ? error.message : ""] ||
          "Please check your entries and complete all required fields.",
      );
      return;
    }
    const idempotencyKey = key || crypto.randomUUID();
    setKey(idempotencyKey);
    setState("sending");
    setMessage("");
    let responseStatus = 0;
    try {
      const response = await fetch(`${api.replace(/\/$/, "")}/v1/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });
      responseStatus = response.status;
      const result = (await response.json()) as {
        reference?: string;
        error?: string;
      };
      if (!response.ok || !result.reference)
        throw new Error(result.error || "temporarily_unavailable");
      setReference(result.reference);
      setState("success");
    } catch (error) {
      setState("idle");
      if ([400, 403, 409].includes(responseStatus)) setKey("");
      setMessage(
        validationMessages[error instanceof Error ? error.message : ""] ||
          "We could not save your enquiry. Your entries are still here. Please retry or contact us directly.",
      );
      if (widgetId.current) {
        window.turnstile?.reset(widgetId.current);
        setToken("");
      }
    }
  }
  return (
    <section className="platform-enquiry" id="enquiry">
      <div className="platform-wrap platform-enquiry__grid">
        <div>
          <p className="platform-eyebrow">Start a conversation</p>
          <h2>{labels[kind]}</h2>
          <p>
            {api
              ? "Share only what is needed for the team to reply. A submitted enquiry does not confirm a price, partnership, registration, or availability."
              : "Contact the team directly. Include your topic, city or country, and any product details so we can help with your enquiry."}
          </p>
          <p>
            <a href={`mailto:${verifiedBusiness.email}`}>
              Email {verifiedBusiness.email}
            </a>
            <br />
            <a href={`tel:+${verifiedBusiness.phoneHref}`}>
              Call {verifiedBusiness.phoneDisplay}
            </a>
          </p>
        </div>
        <div className="platform-enquiry__card">
          {!api ? (
            <div className="direct-enquiry">
              <h3>Let’s talk directly.</h3>
              <p>
                Online enquiry forms are currently unavailable. Please email or
                call the team.
              </p>
              <div className="platform-actions">
                <a
                  className="platform-action"
                  href={`mailto:${verifiedBusiness.email}?subject=${encodeURIComponent(productTitle ? `Product enquiry: ${productTitle}` : labels[kind])}`}
                >
                  Email the team <LinkArrow />
                </a>
                <a
                  className="platform-action platform-action--secondary"
                  href={`tel:+${verifiedBusiness.phoneHref}`}
                >
                  Call the team <LinkArrow />
                </a>
              </div>
            </div>
          ) : state === "success" ? (
            <div role="status">
              <h3>Your enquiry was received.</h3>
              <p>
                Reference: <strong>{reference}</strong>
              </p>
              <p>
                Please keep this number. It confirms storage of your enquiry;
                notification delivery and a team response are separate steps.
              </p>
            </div>
          ) : (
            <>
              <form
                onSubmit={submit}
                noValidate
                onInvalid={(event) => {
                  const field = event.target as HTMLInputElement;
                  const label =
                    field.labels?.[0]?.textContent?.trim() || "Required field";
                  setMessage(`${label}: ${field.validationMessage}`);
                }}
              >
                <div className="platform-enquiry__fields">
                  <label>
                    Name{" "}
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={120}
                      autoComplete="name"
                    />
                  </label>
                  <label>
                    {replyChannel === "email"
                      ? "Email (required for email replies)"
                      : "Email (optional if phone provided)"}{" "}
                    <input
                      name="email"
                      type="email"
                      required={replyChannel === "email"}
                      maxLength={254}
                      autoComplete="email"
                    />
                  </label>
                  <label>
                    {replyChannel === "phone"
                      ? "Phone (required for phone replies)"
                      : "Phone (optional if email provided)"}{" "}
                    <input
                      name="phone"
                      type="tel"
                      required={replyChannel === "phone"}
                      inputMode="tel"
                      maxLength={32}
                      autoComplete="tel"
                    />
                  </label>
                  {(kind === "wholesale" ||
                    kind === "partnership" ||
                    kind === "expert") && (
                    <label>
                      Organization{" "}
                      {kind === "partnership" ? "(required)" : "(optional)"}
                      <input
                        name="organization"
                        required={kind === "partnership"}
                        maxLength={160}
                        autoComplete="organization"
                      />
                    </label>
                  )}
                  {(kind === "artisan" || kind === "wholesale") && (
                    <label>
                      {kind === "artisan"
                        ? "District or region"
                        : "Country or destination"}
                      <input
                        name="location"
                        required={kind === "artisan"}
                        maxLength={120}
                      />
                    </label>
                  )}
                  {!productTitle && (
                    <label>
                      {kind === "artisan"
                        ? "Craft or skill"
                        : kind === "expert"
                          ? "Area of expertise"
                          : "Topic or product"}
                      <input
                        name="subject"
                        required={
                          kind === "artisan" ||
                          kind === "expert" ||
                          kind === "wholesale"
                        }
                        maxLength={160}
                      />
                    </label>
                  )}
                  <label>
                    Preferred reply channel{" "}
                    <select
                      name="preferredChannel"
                      required
                      value={replyChannel}
                      onChange={(event) => setReplyChannel(event.target.value)}
                    >
                      <option value="" disabled>
                        Choose one
                      </option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </label>
                  <label>
                    Preferred language{" "}
                    <select name="preferredLanguage" defaultValue="en">
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                      <option value="sd">Sindhi</option>
                    </select>
                  </label>
                </div>
                <label>
                  Tell us about your enquiry{" "}
                  <textarea
                    name="message"
                    minLength={10}
                    maxLength={3000}
                    required
                    rows={5}
                  />
                </label>
                <div className="platform-enquiry__trap" aria-hidden="true">
                  <label>
                    Website{" "}
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <label className="platform-enquiry__consent">
                  <input type="checkbox" name="consent" required /> I agree to
                  Thar Textiles using these details to respond to this enquiry.{" "}
                  <Link href="/privacy/">Read the privacy notice.</Link>
                </label>
                {siteKey && (
                  <div
                    ref={widget}
                    role="group"
                    aria-label="Spam verification"
                  />
                )}
                {api && !siteKey && process.env.NODE_ENV === "production" && (
                  <p role="status">
                    Verification is not configured. Please use email or
                    telephone.
                  </p>
                )}
                {message && <p role="alert">{message}</p>}
                <button
                  type="submit"
                  disabled={
                    !hydrated || !api || !verification || state === "sending"
                  }
                >
                  {state === "sending" ? "Saving enquiry…" : "Send enquiry"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
