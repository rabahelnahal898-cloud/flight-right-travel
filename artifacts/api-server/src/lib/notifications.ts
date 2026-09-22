import { config } from "./config";
import { logger } from "./logger";

type Notification = {
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail(notification: Notification) {
  if (!config.emailEnabled) return { sent: false, reason: "EMAIL_NOT_CONFIGURED" } as const;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.emailFrom,
      to: [config.contactEmail],
      subject: notification.subject,
      text: notification.text,
      ...(notification.replyTo ? { reply_to: notification.replyTo } : {}),
    }),
  });

  if (!response.ok) throw new Error(`Resend request failed with ${response.status}`);
  return { sent: true, provider: "resend" } as const;
}

export async function sendWhatsApp(notification: Notification) {
  if (!config.whatsappEnabled) return { sent: false, reason: "WHATSAPP_NOT_CONFIGURED" } as const;

  const response = await fetch(`https://graph.facebook.com/v21.0/${config.whatsappPhoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.whatsappAccessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: config.whatsappRecipientNumber,
      type: "text",
      text: { preview_url: false, body: `${notification.subject}\n\n${notification.text}` },
    }),
  });

  if (!response.ok) throw new Error(`WhatsApp request failed with ${response.status}`);
  return { sent: true, provider: "whatsapp" } as const;
}

export async function notifyTeam(notification: Notification) {
  const results = await Promise.allSettled([sendEmail(notification), sendWhatsApp(notification)]);
  results.forEach((result) => {
    if (result.status === "rejected") logger.warn({ err: result.reason }, "Team notification failed");
  });
  return results;
}