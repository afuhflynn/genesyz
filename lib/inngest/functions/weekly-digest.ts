import { inngest } from "../client";
import { db } from "@/lib/db";
import { sendDigestEmail, sendStrategicAdvisoryEmail } from "@/lib/email/send";
import { runStrategicAdvisoryAgent } from "@/lib/agents/strategic-advisory";
import type { StrategicAdvisory } from "@/lib/agents/types";

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

  // { cron: "*/1 * * * *" }, // Every 5 minutes
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
              researchPackets: {
                where: { agentType: "INTERPRETER" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5, // Get top 5 recent ideas
          },
        },
      });
    });

    // fail fast if no users
    if (!users) {
      throw new Error("No users found");
    }

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
          // 1. Calculate summary stats for basic digest
          const totalIdeas = user.ideas.length;
          const avgScore =
            user.ideas.reduce((sum, idea) => {
              const score = idea.scores[0]?.overallScore || 0;
              return sum + score;
            }, 0) / totalIdeas || 0;

          // 2. Run Strategic Advisory Agent for top-tier report
          const advisory = (await runStrategicAdvisoryAgent({
            userId: user.id,
            ideas: user.ideas.map((idea) => {
              const interpreterPacket = idea.researchPackets[0];
              const content = interpreterPacket?.content as any;
              return {
                id: idea.id,
                title: idea.title || "Untitled Idea",
                summary: idea.summary || "",
                category: content?.category || "saas",
                overallScore: idea.scores[0]?.overallScore || 0,
              };
            }),
          })) as StrategicAdvisory;

          // 3. Send the professional Strategic Advisory email
          await sendStrategicAdvisoryEmail({
            to: user.email,
            userName: user.name || "Founder",
            advisory,
          });

          emailResults.push({ userId: user.id, success: true });
        } catch (error) {
          console.error(`Error sending digest to user ${user.id}:`, error);
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
