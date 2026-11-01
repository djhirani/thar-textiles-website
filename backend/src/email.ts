export type EmailEnv = {
  EMAIL_TRANSPORT: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_ADMIN_TO?: string;
  ADMIN_DASHBOARD_URL?: string;
  ENVIRONMENT: string;
};
export type OutboxItem = {
  id: string;
  reference: string;
  event_type: string;
  kind: string;
  email: string | null;
  status: string;
};
export function emailContent(item: OutboxItem, env: EmailEnv) {
  if (item.event_type === "admin_alert")
    return {
      to: env.EMAIL_ADMIN_TO,
      subject: `New Thar Textiles enquiry ${item.reference}`,
      text: `A ${item.kind} enquiry was received. Reference: ${item.reference}. Review it in the private dashboard: ${env.ADMIN_DASHBOARD_URL || "(dashboard URL not configured)"}`,
    };
  if (item.event_type === "acknowledgement")
    return {
      to: item.email,
      subject: `Thar Textiles enquiry ${item.reference}`,
      text: `Your enquiry was received. Reference: ${item.reference}. This confirms receipt only; a team member has not yet reviewed it.`,
    };
  return {
    to: item.email,
    subject: `Thar Textiles enquiry update ${item.reference}`,
    text: `The status of your enquiry ${item.reference} is now ${item.status}.`,
  };
}
export async function deliver(
  item: OutboxItem,
  env: EmailEnv,
): Promise<{ state: "sent" | "sent_test"; providerId: string }> {
  const content = emailContent(item, env);
  if (env.EMAIL_TRANSPORT === "test" && env.ENVIRONMENT === "local")
    return { state: "sent_test", providerId: `local-${item.id}` };
  if (
    env.EMAIL_TRANSPORT !== "resend" ||
    !env.RESEND_API_KEY ||
    !env.EMAIL_FROM ||
    !content.to ||
    !env.EMAIL_ADMIN_TO ||
    !env.ADMIN_DASHBOARD_URL
  )
    throw new Error("email_not_configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": item.id,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [content.to],
      subject: content.subject,
      text: content.text,
    }),
  });
  if (!response.ok) throw new Error(`email_provider_${response.status}`);
  const result = (await response.json()) as { id?: string };
  if (!result.id) throw new Error("email_provider_invalid_response");
  return { state: "sent", providerId: result.id };
}
