import { describe, expect, it } from "vitest";
import { deliver, emailContent } from "./email";

describe("notification adapter", () => {
  it("creates a minimal admin alert without applicant message data", () => {
    const content = emailContent(
      {
        id: "1",
        reference: "TT-20261011-ABCD1234",
        event_type: "admin_alert",
        kind: "wholesale",
        email: null,
        status: "new",
      },
      {
        EMAIL_TRANSPORT: "test",
        ENVIRONMENT: "local",
        EMAIL_ADMIN_TO: "team@example.org",
        ADMIN_DASHBOARD_URL: "https://admin.example.org",
      },
    );
    expect(content.text).toContain("TT-20261011-ABCD1234");
    expect(content.text).not.toContain("private message");
  });
  it("marks test delivery as test only in local environment", async () => {
    await expect(
      deliver(
        {
          id: "id-1",
          reference: "TT-X",
          event_type: "acknowledgement",
          kind: "general",
          email: "person@example.org",
          status: "new",
        },
        { EMAIL_TRANSPORT: "test", ENVIRONMENT: "local" },
      ),
    ).resolves.toEqual({ state: "sent_test", providerId: "local-id-1" });
  });
  it("fails closed outside local test transport", async () => {
    await expect(
      deliver(
        {
          id: "id-1",
          reference: "TT-X",
          event_type: "admin_alert",
          kind: "general",
          email: null,
          status: "new",
        },
        { EMAIL_TRANSPORT: "test", ENVIRONMENT: "production" },
      ),
    ).rejects.toThrow("email_not_configured");
  });
});
