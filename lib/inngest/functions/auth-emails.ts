import { inngest } from "../client";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email/send";
import { sendEmail } from "@/lib/email/client";

export const sendVerificationEmailFunction = inngest.createFunction(
  { id: "send-verification-email", name: "Send Verification Email" },
  { event: "email.send.verification" },
  async ({ event, step }) => {
    const { email, name, code, url } = event.data;

    await step.run("send-email", async () => {
      await sendVerificationEmail({
        to: email,
        userName: name,
        code,
        url,
      });
    });

    return { success: true, email };
  }
);

export const sendWelcomeEmailFunction = inngest.createFunction(
  { id: "send-welcome-email", name: "Send Welcome Email" },
  { event: "email.send.welcome" },
  async ({ event, step }) => {
    const { email, name, username } = event.data;

    await step.run("send-email", async () => {
      await sendEmail({
        to: email,
        subject: "Welcome to IdeasVault!",
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>We're excited to have you on board. Your username is <strong>${username}</strong>.</p>
          <p>Start capturing your brilliant ideas today!</p>
        `,
        text: `Welcome to IdeasVault, ${name}! Your username is ${username}.`,
      });
    });

    return { success: true, email };
  }
);

export const sendPasswordResetEmailFunction = inngest.createFunction(
  { id: "send-password-reset-email", name: "Send Password Reset Email" },
  { event: "email.send.passwordReset" },
  async ({ event, step }) => {
    const { email, name, url } = event.data;

    await step.run("send-email", async () => {
      await sendPasswordResetEmail({
        to: email,
        userName: name,
        url,
      });
    });

    return { success: true, email };
  }
);

export const sendMagicLinkEmailFunction = inngest.createFunction(
  { id: "send-magic-link-email", name: "Send Magic Link Email" },
  { event: "email.send.magicLink" },
  async ({ event, step }) => {
    const { email, url } = event.data;

    await step.run("send-email", async () => {
      const { sendMagicLinkEmail } = await import("@/lib/email/send");
      await sendMagicLinkEmail({
        to: email,
        url,
      });
    });

    return { success: true, email };
  }
);
