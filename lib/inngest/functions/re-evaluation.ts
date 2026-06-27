import { runResearchPipeline } from "@/lib/agents/pipeline";
import { db } from "@/lib/db";
import { inngest } from "../client";

/**
 * Re-evaluation Cron Function
 * Runs every month to re-evaluate active ideas
 * Ensures market data stays fresh
 */
export const reevaluationFunction = inngest.createFunction(
  {
    id: "monthly-reevaluation",
    name: "Monthly Idea Re-evaluation",
    triggers: { cron: "0 0 1 * *" },
  }, // First day of every month
  async ({ step }) => {
    // Step 1: Get all active ideas eligible for re-evaluation
    // (e.g., researched > 30 days ago and not archived)
    const ideas = await step.run("get-ideas-to-reevaluate", async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await db.idea.findMany({
        where: {
          isArchived: false,
          status: "RESEARCHED",
          researchedAt: {
            lt: thirtyDaysAgo,
          },
        },
        select: { id: true, userId: true },
        take: 50, // Process in batches to avoid timeouts
      });
    });

    // Step 2: Trigger re-research for each idea
    const events = ideas.map((idea) => ({
      name: "idea.submitted",
      data: {
        ideaId: idea.id,
        userId: idea.userId,
      },
    }));

    if (events.length > 0) {
      await step.sendEvent("trigger-research-jobs", events);
    }

    // Step 3: Log activity
    await step.run("log-reevaluation", async () => {
      await db.auditLog.create({
        data: {
          action: "reevaluation.triggered",
          resource: "system",
          metadata: {
            count: ideas.length,
          },
        },
      });
    });

    return {
      triggered: ideas.length,
    };
  },
);
