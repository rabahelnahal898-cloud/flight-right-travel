import { config } from "./config";
import { logger } from "./logger";
import nodemailer from "nodemailer";

type Notification = {
  subject: string;
  text: string;
  replyTo?: string;
};

// Simple email using Gmail SMTP - NO API NEEDED!
export async function sendEmail(notification: Notification) {
  if (!config.contactEmail) return { sent: false, reason: "EMAIL_NOT_CONFIGURED" } as const;

  try {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.smtpUser || config.contactEmail,
        pass: config.smtpPassword || "temporary", // Will need app password
      },
    });

    await transporter.sendMail({
      from: config.emailFrom || config.contactEmail,
      to: config.contactEmail,
      subject: notification.subject,
      text: notification.text,
      replyTo: notification.replyTo,
    });

    return { sent: true, provider: "smtp" } as const;
  } catch (error) {
    logger.error({ error }, "Failed to send email");
    return { sent: false, reason: "SMTP_ERROR" } as const;
  }
}

// Simple WhatsApp - just log for now, you can manually forward
export async function sendWhatsApp(notification: Notification) {
  if (!config.whatsappRecipientNumber) return { sent: false, reason: "WHATSAPP_NOT_CONFIGURED" } as const;

  // Log the message so you can manually forward it via WhatsApp Web
  const message = `${notification.subject}\n\n${notification.text}`;
  logger.info({ 
    whatsapp: config.whatsappRecipientNumber, 
    message 
  }, "WhatsApp notification (forward manually to +201282220484)");

  // Generate WhatsApp Web link
  const whatsappUrl = `https://wa.me/${config.whatsappRecipientNumber.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
  logger.info({ whatsappUrl }, "Click this link to send via WhatsApp Web");

  return { sent: true, provider: "whatsapp-manual" } as const;
}

export async function notifyTeam(notification: Notification) {
  const results = await Promise.allSettled([sendEmail(notification), sendWhatsApp(notification)]);
  results.forEach((result) => {
    if (result.status === "rejected") logger.warn({ err: result.reason }, "Team notification failed");
  });
  return results;
}