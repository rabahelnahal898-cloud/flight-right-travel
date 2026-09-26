import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const localEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));
if (existsSync(localEnvPath)) loadEnvFile(localEnvPath);

const duffelToken = process.env["DUFFEL_API_TOKEN"]?.trim();
const stripeSecretKey = process.env["STRIPE_SECRET_KEY"]?.trim();
const stripeWebhookSecret = process.env["STRIPE_WEBHOOK_SECRET"]?.trim();
const contactEmail = process.env["CONTACT_EMAIL"]?.trim();
const emailFrom = process.env["EMAIL_FROM"]?.trim();
const smtpUser = process.env["SMTP_USER"]?.trim();
const smtpPassword = process.env["SMTP_PASSWORD"]?.trim();
const whatsappRecipientNumber = process.env["WHATSAPP_RECIPIENT_NUMBER"]?.trim();

export const config = {
  duffelToken,
  duffelApiUrl: process.env["DUFFEL_API_URL"]?.trim() || "https://api.duffel.com",
  duffelEnabled: Boolean(duffelToken),
  stripeSecretKey,
  stripeWebhookSecret,
  stripeEnabled: Boolean(stripeSecretKey),
  contactEmail,
  emailFrom,
  smtpUser,
  smtpPassword,
  whatsappRecipientNumber,
};