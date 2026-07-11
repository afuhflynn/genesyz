import nodemailer from "nodemailer";

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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("[Email] SMTP not configured, skipping email send");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `Flynn at ${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.SMTP_USER}>`,
      replyTo: "Genesyz <noreply@genesyz.ai>",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: [
        {
          filename: "Genesyz Logo",
          path: "https://res.cloudinary.com/duzg7l0eo/image/upload/v1772257771/logo-email_z85ejj.png", // path to your image
          cid: "unique-app-logo", // must match the src in HTML
          contentDisposition: "inline", // helps prevent showing as a separate attachment
        },
      ],
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
