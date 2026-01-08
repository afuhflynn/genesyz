import { inngest } from "../client";
import { db } from "@/lib/db";
import { sendDigestEmail } from "@/lib/email/send";

/**
 * Weekly Digest Cron Function
 * Runs every Monday at 9:00 AM UTC
 * Sends personalized digest emails to all active users
 */
export const weeklyDigestFunction = inngest.createFunction(
  {
    id: "weekly-digest",
    name: "Weekly Digest Email",
  },
  { cron: "0 9 * * 1" }, // Every Monday at 9:00 AM UTC
  async ({ step }) => {
    // Step 1: Get all users with active ideas
    const users = await step.run("get-active-users", async () => {
      return await db.user.findMany({
        where: {
          ideas: {
            some: {
              isArchived: false,
              status: "RESEARCHED",
            },
          },
        },
        include: {
          ideas: {
            where: {
              isArchived: false,
              status: "RESEARCHED",
            },
            include: {
              scores: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5, // Get top 5 recent ideas
          },
        },
      });
    });

    // Step 2: Send digest to each user
    const results = await step.run("send-digests", async () => {
      const emailResults: {
        userId: string;
        success: boolean;
        error?: string;
      }[] = [];

      for (const user of users) {
        if (!user.email) continue;

        try {
          // Calculate summary stats
          const totalIdeas = user.ideas.length;
          const avgScore =
            user.ideas.reduce((sum, idea) => {
              const score = idea.scores[0]?.overallScore || 0;
              return sum + score;
            }, 0) / totalIdeas || 0;

          const topIdeas = user.ideas
            .sort((a, b) => {
              const scoreA = a.scores[0]?.overallScore || 0;
              const scoreB = b.scores[0]?.overallScore || 0;
              return scoreB - scoreA;
            })
            .slice(0, 3);

          await sendDigestEmail({
            to: user.email,
            userName: user.name || "Founder",
            totalIdeas,
            averageScore: Math.round(avgScore),
            topIdeas: topIdeas.map((idea) => ({
              id: idea.id,
              title: idea.title || "Untitled Idea",
              score: idea.scores[0]?.overallScore || 0,
            })),
          });

          emailResults.push({ userId: user.id, success: true });
        } catch (error) {
          emailResults.push({
            userId: user.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return emailResults;
    });

    // Step 3: Log results
    await step.run("log-results", async () => {
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      await db.auditLog.create({
        data: {
          action: "digest.sent",
          resource: "email",
          metadata: {
            totalUsers: users.length,
            successful,
            failed,
          },
        },
      });
    });

    return {
      totalUsers: users.length,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }
);
