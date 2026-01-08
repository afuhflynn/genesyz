import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { magicLink } from "better-auth/plugins";
import { Polar } from "@polar-sh/sdk";
import { syncEntitlement } from "@/lib/polar/entitlements";
import { inngest } from "./inngest/client";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 30,
    async sendResetPassword({ user, url }, request) {
      await inngest.send({
        name: "email.send.passwordReset",
        data: {
          email: user.email,
          name: user.name,
          url,
        },
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session for 5 minutes
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL! || "http://localhost:3000"],
  plugins: [
    polar({
      client: new Polar({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        server: "sandbox",
      }),

      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRO_PRODUCT_ID!,
              slug: "pro",
            },
          ],
          successUrl: "/dashboard?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionCreated: async (payload) => {
            await handleSubscriptionChange(payload.data);
          },
          onSubscriptionUpdated: async (payload) => {
            await handleSubscriptionChange(payload.data);
          },
          onSubscriptionActive: async (payload) => {
            await handleSubscriptionChange(payload.data);
          },
          onSubscriptionCanceled: async (payload) => {
            await handleSubscriptionCanceled(payload.data);
          },
          onSubscriptionRevoked: async (payload) => {
            await handleSubscriptionRevoked(payload.data);
          },
        }),
      ],
    }),
    magicLink({
      async sendMagicLink({ email, url }, request) {
        await inngest.send({
          name: "email.send.magicLink",
          data: {
            email,
            url,
          },
        });
      },
    }),
  ],
});

// Helper functions for Polar webhooks
async function handleSubscriptionChange(data: any) {
  const userId = data.metadata?.userId || data.user_id;
  if (!userId) return;

  const plan =
    data.product_id === process.env.POLAR_PRO_PRODUCT_ID ? "PRO" : "FREE";

  await syncEntitlement(userId, {
    polarCustomerId: data.customer_id,
    polarSubscriptionId: data.id,
    plan,
    status: data.status === "active" ? "ACTIVE" : "PAST_DUE",
    currentPeriodEnd: data.current_period_end
      ? new Date(data.current_period_end)
      : undefined,
    cancelAtPeriodEnd: data.cancel_at_period_end || false,
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "subscription.updated",
      resource: "entitlement",
      metadata: {
        plan,
        status: data.status,
        subscriptionId: data.id,
      },
    },
  });
}

async function handleSubscriptionCanceled(data: any) {
  const userId = data.metadata?.userId || data.user_id;
  if (!userId) return;

  await syncEntitlement(userId, {
    polarCustomerId: data.customer_id,
    polarSubscriptionId: data.id,
    plan: "FREE",
    status: "CANCELED",
    currentPeriodEnd: data.current_period_end
      ? new Date(data.current_period_end)
      : undefined,
    cancelAtPeriodEnd: true,
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "subscription.canceled",
      resource: "entitlement",
      metadata: { subscriptionId: data.id },
    },
  });
}

async function handleSubscriptionRevoked(data: any) {
  const userId = data.metadata?.userId || data.user_id;
  if (!userId) return;

  await syncEntitlement(userId, {
    polarCustomerId: data.customer_id,
    polarSubscriptionId: data.id,
    plan: "FREE",
    status: "EXPIRED",
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "subscription.expired",
      resource: "entitlement",
      metadata: { subscriptionId: data.id },
    },
  });
}

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
