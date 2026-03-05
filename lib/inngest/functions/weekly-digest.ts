import { runStrategicAdvisoryAgent } from "@/lib/agents/strategic-advisory";
import type { StrategicAdvisory } from "@/lib/agents/types";
import { db } from "@/lib/db";
import { sendWeeklyStrategicReportEmail } from "@/lib/email/send";
import { inngest } from "../client";

/**
 * Weekly Digest Cron Function
 * Runs every Monday at 9:00 AM UTC
 * Sends personalized digest emails to all active users
 */
export const weeklyStrategicReportFunction = inngest.createFunction(
  {
    id: "weekly-strategic-report",
    name: "Weekly Strategic Report",
  },
  { cron: "0 9 * * 1" }, // Every Monday at 9:00 AM UTC

  async ({ step }: { step: any }) => {
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
              snapshots: {
                orderBy: { date: "desc" },
                take: 12, // Keep 12 weeks of memory
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

    // Step 2: Send strategic report to each user
    const results = await step.run("send-reports", async () => {
      const emailResults: {
        userId: string;
        success: boolean;
        error?: string;
      }[] = [];

      // Re-fetch users with full context for stateful run
      const usersWithContext = await db.user.findMany({
        where: {
          id: { in: users.map((u: any) => u.id) },
        },
        include: {
          ideas: {
            where: {
              isArchived: false,
              status: "RESEARCHED",
            },
            include: {
              researchPackets: {
                where: { agentType: "INTERPRETER" },
                take: 1,
              },
              snapshots: {
                orderBy: { date: "desc" },
                take: 12, // Keep 12 weeks of memory
              },
              startup: true,
            },
          },
        },
      });

      for (const user of usersWithContext) {
        if (!user.email) continue;

        try {
          // 1. Run Strategic Advisory Agent for top-tier report
          const advisory = (await runStrategicAdvisoryAgent({
            userId: user.id,
            ideas: user.ideas.map((idea: any) => {
              const interpreterPacket = idea.researchPackets[0];
              const content = interpreterPacket?.content as any;
              return {
                id: idea.id,
                title: idea.title || "Untitled Idea",
                summary: idea.summary || "",
                category: content?.category || "saas",
                overallScore: 0, // Scores are deprecated in favor of verdicts
                metrics: idea.metrics,
                history: idea.snapshots.map((s: any) => ({
                  date: s.date,
                  verdict: s.verdict,
                })),
              };
            }),
          })) as StrategicAdvisory;

          // 2. Persist verdicts and snapshots
          for (const verdict of advisory.verdicts) {
            const idea = user.ideas.find((i: any) => i.id === verdict.ideaId);
            if (idea) {
              const lastSnapshot = idea.snapshots[0];
              const lastVerdict = lastSnapshot?.verdict as any;

              // Calculate robust deltas
              const deltas = {
                verdictChanged: lastVerdict
                  ? lastVerdict.verdict !== verdict.verdict
                  : false,
                priorityChanged: lastVerdict
                  ? lastVerdict.onePriority !== verdict.onePriority
                  : false,
                newRisks: lastVerdict
                  ? verdict.topRisk.description !==
                    lastVerdict.topRisk.description
                  : true,
                metricDeltas: {} as Record<string, number>,
              };

              // Calculate metric deltas if they exist
              if (idea.metrics && typeof idea.metrics === "object") {
                const currentMetrics = idea.metrics as Record<string, any>;
                const lastState = lastSnapshot?.state as any;
                const lastMetrics = lastState?.metrics as Record<string, any>;

                if (lastMetrics) {
                  for (const [key, val] of Object.entries(currentMetrics)) {
                    if (
                      typeof val === "number" &&
                      typeof lastMetrics[key] === "number"
                    ) {
                      const diff = val - lastMetrics[key];
                      const percentChange =
                        lastMetrics[key] !== 0
                          ? (diff / lastMetrics[key]) * 100
                          : 0;
                      deltas.metricDeltas[key] = Math.round(percentChange);
                    }
                  }
                }
              }

              await db.ideaSnapshot.create({
                data: {
                  ideaId: idea.id,
                  state: {
                    metrics: idea.metrics,
                    assumptions: idea.assumptions,
                    signals: [],
                  },
                  verdict: verdict as any,
                  deltas: deltas as any,
                },
              });
            }
          }

          // 3. Send the weekly strategic report email
          await sendWeeklyStrategicReportEmail({
            to: user.email,
            userName: user.name || "Founder",
            advisory,
          });

          // 4. Create Research Feed Items for each startup in the digest
          const today = new Date().toISOString().split("T")[0]; // Use date as part of key
          for (const verdict of advisory.verdicts) {
            const idea = user.ideas.find((i: any) => i.id === verdict.ideaId);
            if (idea && idea.startup) {
              const idempotencyKey = `weekly-digest-${idea.startup.id}-${today}`;
              await db.researchFeedItem.upsert({
                where: { idempotencyKey },
                create: {
                  startupId: idea.startup.id,
                  type: "WEEKLY_DIGEST",
                  title: `Weekly Strategic Digest: ${idea.startup.name}`,
                  summary: verdict.executiveSummary,
                  idempotencyKey,
                  content: {
                    verdict: verdict.verdict,
                    onePriority: verdict.onePriority,
                    topRisk: verdict.topRisk,
                  },
                },
                update: {
                  summary: verdict.executiveSummary,
                  content: {
                    verdict: verdict.verdict,
                    onePriority: verdict.onePriority,
                    topRisk: verdict.topRisk,
                  },
                },
              });
            }
          }

          emailResults.push({ userId: user.id, success: true });
        } catch (error) {
          emailResults.push({
            userId: user.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          console.error(`Error sending report to user ${user.id}:`, error);
          throw new Error(`Error sending report to user ${user.id}: ${error}`);
        }
      }

      return emailResults;
    });

    // Step 3: Log results
    await step.run("log-results", async () => {
      const successful = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;

      await db.auditLog.create({
        data: {
          action: "strategic_report.sent",
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
      sent: results.filter((r: any) => r.success).length,
      failed: results.filter((r: any) => !r.success).length,
    };
  },
);
