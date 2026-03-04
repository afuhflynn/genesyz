import { db } from "@/lib/db";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/email/send";
import { PLANS } from "@/lib/polar/client";
import { inngest } from "../client";

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
  },
);

export const sendWelcomeEmailFunction = inngest.createFunction(
  { id: "send-welcome-email", name: "Send Welcome Email" },
  { event: "email.send.welcome" },
  async ({ event, step }) => {
    const { email, name } = event.data;

    await step.run("create-entitlement", async () => {
      const user = await db.user.findUnique({
        where: {
          name: name,
          email,
        },
      });

      if (!user) {
        throw new Error("Failed to create user");
      }
      await db.entitlement.create({
        data: {
          userId: user.id,
          plan: "FREE",
          maxActiveIdeas: PLANS.FREE.maxActiveIdeas,
          status: "ACTIVE",
        },
      });
    });

    await step.run("send-email", async () => {
      await sendWelcomeEmail({
        to: email,
        userName: name,
      });
    });

    return { success: true, email };
  },
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
  },
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
  },
);
