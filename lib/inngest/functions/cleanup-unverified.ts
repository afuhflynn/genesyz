import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { renderPremiumEmail } from "@/lib/email/send";
import { inngest } from "../client";

export const cleanupUnverifiedUsers = inngest.createFunction(
  {
    id: "cleanup-unverified-users",
    name: "Cleanup Unverified Users",
    triggers: {
      cron: "0 0 1 */1 *",
    },
  },
  async ({ step }) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const staleUsers = await step.run("find-stale-users", async () => {
      return db.user.findMany({
        where: {
          emailVerified: false,
          createdAt: { lte: thirtyDaysAgo },
          accountStatus: "ACTIVE",
        },
        select: { id: true, email: true, name: true, createdAt: true },
      });
    });

    const reminderUsers: typeof staleUsers = [];
    const deleteCandidates: typeof staleUsers = [];

    for (const user of staleUsers) {
      const createdAt = new Date(user.createdAt);
      if (createdAt <= ninetyDaysAgo) {
        deleteCandidates.push(user);
      } else {
        reminderUsers.push(user);
      }
    }

    if (reminderUsers.length > 0) {
      await step.run("send-reminders", async () => {
        const results = await Promise.allSettled(
          reminderUsers.map(async (user) => {
            const contentHtml = `
              <h2 style="font-size: 24px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
                Verify your email
              </h2>
              <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
                Hi ${user.name || "there"}, your Genesyz account is still unverified.
              </p>
              <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
                Unverified accounts are deleted after 90 days. Please verify your email to keep your account.
              </p>
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email/resend" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px;">
                  Verify Email
                </a>
              </div>
            `;
            const html = renderPremiumEmail({
              title: "Verify your email",
              contentHtml,
            });
            await sendEmail({
              to: user.email,
              subject: "Verify your Genesyz account",
              html,
            });
          }),
        );
        return {
          sent: results.filter((r) => r.status === "fulfilled").length,
          failed: results.filter((r) => r.status === "rejected").length,
        };
      });
    }

    if (deleteCandidates.length > 0) {
      await step.run("delete-stale-users", async () => {
        const ids = deleteCandidates.map((u) => u.id);
        await db.user.deleteMany({ where: { id: { in: ids } } });
        return { deleted: ids.length };
      });
    }

    return {
      reminderEmailsSent: reminderUsers.length,
      accountsDeleted: deleteCandidates.length,
    };
  },
);
