import { resolve } from "node:path";
import nodemailer from "nodemailer";

export function getEmailBranding() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Genesyz";

  return {
    appName,
    logoCid: "genesyz-logo",
    primaryColor: "#ea580c",
    primaryDarkColor: "#c2410c",
    secondaryColor: "#0f172a",
    accentColor: "#fff7ed",
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    mutedTextColor: "#475569",
    subtleTextColor: "#64748b",
    buttonTextColor: "#ffffff",
  };
}

function getEmailFromAddress() {
  const branding = getEmailBranding();
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  if (!fromEmail) {
    return `${branding.appName} <noreply@genesyz.ai>`;
  }

  return `${branding.appName} <${fromEmail}>`;
}

function getReplyToAddress() {
  return process.env.EMAIL_REPLY_TO || "Genesyz <noreply@genesyz.ai>";
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  // Preview mode: write HTML to disk instead of sending via SMTP.
  // Set PREVIEW_EMAILS_DIR env var to activate (never set in production).
  const previewDir = process.env.PREVIEW_EMAILS_DIR;
  if (previewDir) {
    const fs = await import("node:fs");
    const path = await import("node:path");
    if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });
    const existing = fs.readdirSync(previewDir).length + 1;
    const safe = options.subject
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60);
    const file = path.join(previewDir, `${String(existing).padStart(2, "0")}_${safe}.html`);
    fs.writeFileSync(file, options.html, "utf-8");
    console.log(`[Preview] Saved: ${path.basename(file)}`);
    return true;
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("[Email] SMTP not configured, skipping email send");
    return false;
  }

  try {
    await transporter.sendMail({
      from: getEmailFromAddress(),
      replyTo: getReplyToAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

// Verify connection configuration
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
