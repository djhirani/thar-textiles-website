import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { EnquiryForm } from "./enquiry-form";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  delete window.turnstile;
});

function verifiedUnitForm(
  kind: "wholesale" | "artisan" | "partnership" | "expert" | "general",
) {
  vi.stubEnv(
    "NEXT_PUBLIC_ENQUIRY_API_URL",
    "https://thar-textiles-staging-api.jrhirani.workers.dev",
  );
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "unit-test-site-key");
  // Simulated widget only inside jsdom; never sent to a real backend.
  window.turnstile = {
    render: (_element, options) => {
      options.callback("unit-test-token");
      return "unit-widget";
    },
    reset: vi.fn(),
  };
  const view = render(<EnquiryForm kind={kind} />);
  act(() =>
    fireEvent.load(document.head.querySelector('script[src*="turnstile"]')!),
  );
  fireEvent.change(view.container.querySelector('[name="name"]')!, {
    target: { value: "Synthetic test" },
  });
  fireEvent.change(view.container.querySelector('[name="message"]')!, {
    target: { value: "Synthetic unit-test enquiry only." },
  });
  for (const name of ["organization", "subject", "location"]) {
    const field = view.container.querySelector(`[name="${name}"]`);
    if (field)
      fireEvent.change(field, { target: { value: "Synthetic details" } });
  }
  fireEvent.click(screen.getByRole("checkbox", { name: /I agree/ }));
  return view;
}

describe("contact validation and submission feedback", () => {
  it.each([
    "wholesale",
    "artisan",
    "partnership",
    "expert",
    "general",
  ] as const)(
    "%s requires the selected phone contact before sending",
    (kind) => {
      const fetch = vi.fn();
      vi.stubGlobal("fetch", fetch);
      const view = verifiedUnitForm(kind);
      fireEvent.change(
        view.container.querySelector('[name="preferredChannel"]')!,
        { target: { value: "phone" } },
      );
      fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));
      expect(screen.getByRole("alert")).toHaveTextContent(/Phone.*required/);
      expect(fetch).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/Phone \(required/)).toBeRequired();
    },
  );
  it("requires email when email replies are selected, even if a phone is supplied", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const view = verifiedUnitForm("partnership");
    fireEvent.change(view.container.querySelector('[name="phone"]')!, {
      target: { value: "+12025550123" },
    });
    fireEvent.change(
      view.container.querySelector('[name="preferredChannel"]')!,
      { target: { value: "email" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Email.*required/);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends a valid Partnership payload to the configured API and shows only its saved reference", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          reference: "TT-UNITTEST-12345678",
          status: "received",
        }),
        { status: 201 },
      ),
    );
    vi.stubGlobal("fetch", fetch);
    const view = verifiedUnitForm("partnership");
    fireEvent.change(view.container.querySelector('[name="email"]')!, {
      target: { value: "synthetic@example.org" },
    });
    fireEvent.change(
      view.container.querySelector('[name="preferredChannel"]')!,
      { target: { value: "email" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "TT-UNITTEST-12345678",
      ),
    );
    expect(fetch.mock.calls[0][0]).toBe(
      "https://thar-textiles-staging-api.jrhirani.workers.dev/v1/enquiries",
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      kind: "partnership",
      preferredChannel: "email",
      turnstileToken: "unit-test-token",
      consent: true,
    });
  });
  it("keeps entries and shows an accessible error when saving fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "temporarily_unavailable" }), {
          status: 503,
        }),
      ),
    );
    const view = verifiedUnitForm("partnership");
    fireEvent.change(view.container.querySelector('[name="email"]')!, {
      target: { value: "synthetic@example.org" },
    });
    fireEvent.change(
      view.container.querySelector('[name="preferredChannel"]')!,
      { target: { value: "email" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/could not save/),
    );
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Synthetic test");
    expect(
      screen.queryByText("Your enquiry was received."),
    ).not.toBeInTheDocument();
  });
});
describe("staging form verification guard", () => {
  it.each([
    "wholesale",
    "artisan",
    "partnership",
    "expert",
    "general",
  ] as const)(
    "requires a genuine Turnstile token for %s on the staging API",
    (kind) => {
      vi.stubEnv(
        "NEXT_PUBLIC_ENQUIRY_API_URL",
        "https://thar-textiles-staging-api.jrhirani.workers.dev",
      );
      vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key");
      render(<EnquiryForm kind={kind} />);
      expect(
        screen.getByRole("button", { name: "Send enquiry" }),
      ).toBeDisabled();
    },
  );
  it("never enables the localhost fallback against a remote API even without a key", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv(
      "NEXT_PUBLIC_ENQUIRY_API_URL",
      "https://thar-textiles-staging-api.jrhirani.workers.dev",
    );
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    render(<EnquiryForm kind="general" />);
    expect(screen.getByRole("button", { name: "Send enquiry" })).toBeDisabled();
  });
});

describe("email and phone release without an online API", () => {
  it.each([
    "wholesale",
    "artisan",
    "partnership",
    "expert",
    "general",
  ] as const)(
    "%s provides direct contact without collecting entries or loading verification",
    (kind) => {
      vi.stubEnv("NEXT_PUBLIC_ENQUIRY_API_URL", "");
      vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
      const view = render(<EnquiryForm kind={kind} />);
      expect(
        screen.getByText(/Online enquiry forms are currently unavailable/),
      ).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Email the team" }),
      ).toHaveAttribute(
        "href",
        expect.stringContaining("mailto:hello@thartextiles.co?subject="),
      );
      expect(
        screen.getByRole("link", { name: "Call the team" }),
      ).toHaveAttribute("href", "tel:+923342511485");
      expect(view.container.querySelector("form,input,textarea")).toBeNull();
      expect(
        document.head.querySelector('script[src*="turnstile"]'),
      ).toBeNull();
    },
  );
});
