import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import type { WebhookSubscriptionActivePayload } from "@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js";
import type { WebhookSubscriptionCanceledPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncanceledpayload.js";
import type { WebhookSubscriptionCreatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js";
import type { WebhookSubscriptionRevokedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload.js";
import type { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, organization, twoFactor } from "better-auth/plugins";
import { syncEntitlement } from "@/lib/polar/entitlements";
import { db } from "./db";
import { inngest } from "./inngest/client";
import { ac, owner, admin, member, viewer } from "./auth/access";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
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
    additionalFields: {
      name: { type: "string" },
      emailNotifications: { type: "boolean" },
      location: { type: "string" },
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL! || "http://localhost:3000"],
  onAPIError: {
    errorURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign-in`,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.entitlement.create({
            data: {
              userId: user.id,
            },
          });

          const baseSlug = (user.name || user.email || "user")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 60);
          const slug =
            baseSlug ||
            `user-${user.id.slice(0, 8)}`;

          const existing = await db.organization.findUnique({
            where: { slug },
          });

          const finalSlug = existing
            ? `${slug}-${user.id.slice(0, 6)}`
            : slug;

          await db.organization.create({
            data: {
              name: `${user.name || user.email || "User"}'s Organization`,
              slug: finalSlug,
              members: {
                create: {
                  userId: user.id,
                  role: "owner",
                },
              },
            },
          });
        },
      },
    },
  },
  plugins: [
    polar({
      client: new Polar({
        accessToken: process.env.POLAR_ACCESS_TOKEN!,
        server:
          process.env.NODE_ENV === "development" ? "sandbox" : "production",
      }),

      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID!,
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
          onCustomerStateChanged: async (payload) => {
            payload.data.grantedBenefits.forEach(async (b) => {
              // @todo Work on this later
              // b.properties.
              console.log(b);
            });
          },
          onSubscriptionCreated: async (payload) => {
            await handleSubscriptionChange(payload);
          },
          onSubscriptionUpdated: async (payload) => {
            await handleSubscriptionChange(payload);
          },
          onSubscriptionActive: async (payload) => {
            await handleSubscriptionChange(payload);
          },
          onSubscriptionCanceled: async (payload) => {
            await handleSubscriptionCanceled(payload);
          },
          onSubscriptionRevoked: async (payload) => {
            await handleSubscriptionRevoked(payload);
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
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
        viewer,
      },
      allowUserToCreateOrganization: true,
    }),
    twoFactor({
      totpOptions: {
        period: 30,
      },
    }),
  ],
});

// Helper functions for Polar webhooks
async function handleSubscriptionChange(
  data:
    | WebhookSubscriptionCreatedPayload
    | WebhookSubscriptionUpdatedPayload
    | WebhookSubscriptionActivePayload,
) {
  const userId = data.data.customerId;
  if (!userId) return;

  const plan =
    data.data.productId === process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID
      ? "PRO"
      : "FREE";

  await syncEntitlement(userId, {
    polarCustomerId: data.data.customerId,
    polarSubscriptionId: data.data.id,
    plan,
    status: data.data.status === "active" ? "ACTIVE" : "PAST_DUE",
    currentPeriodEnd: data.data.currentPeriodEnd
      ? new Date(data.data.currentPeriodEnd)
      : undefined,
    cancelAtPeriodEnd: data.data.cancelAtPeriodEnd || false,
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "subscription.updated",
      resource: "entitlement",
      metadata: {
        plan,
        status: data.data.status,
        subscriptionId: data.data.status,
      },
    },
  });
}

async function handleSubscriptionCanceled(
  data: WebhookSubscriptionCanceledPayload,
) {
  const userId = data.data.customerId;
  if (!userId) return;

  await syncEntitlement(userId, {
    polarCustomerId: data.data.customerId,
    polarSubscriptionId: data.data.id,
    plan: "FREE",
    status: "CANCELED",
    currentPeriodEnd: data.data.currentPeriodEnd
      ? new Date(data.data.currentPeriodEnd)
      : undefined,
    cancelAtPeriodEnd: true,
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "subscription.canceled",
      resource: "entitlement",
      metadata: { subscriptionId: data.data.id },
    },
  });
}

async function handleSubscriptionRevoked(
  data: WebhookSubscriptionRevokedPayload,
) {
  const userId = data.data.customerId;
  if (!userId) return;

  await syncEntitlement(userId, {
    polarCustomerId: data.data.customerId,
    polarSubscriptionId: data.data.id,
    plan: "FREE",
    status: "EXPIRED",
  });

  await db.auditLog.create({
    data: {
      userId,
      action: "subscription.expired",
      resource: "entitlement",
      metadata: { subscriptionId: data.data.id },
    },
  });
}

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
