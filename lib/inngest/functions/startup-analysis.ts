import { analyzeWeeklyUpdate } from "@/lib/agents/startup-coach";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";

export const analyzeWeeklyUpdateFn = inngest.createFunction(
  {
    id: "analyze-weekly-update",
    name: "Analyze Weekly Update",
    triggers: { event: "weeklyUpdate.created" },
  },
  async ({ event, step }) => {
    const { updateId, startupId } = event.data;

    const update = await step.run("fetch-update", async () => {
      return db.weeklyUpdate.findUnique({
        where: { id: updateId },
        include: {
          goals: true,
          startup: {
            select: {
              id: true,
              name: true,
              tagline: true,
              description: true,
              industry: true,
              stage: true,
              targetMarket: true,
              currentWeekNumber: true,
            },
          },
        },
      });
    });

    if (!update || !update.startup) {
      throw new Error(`Update ${updateId} or startup not found`);
    }

    const history = await step.run("fetch-history", async () => {
      const previousUpdates = await db.weeklyUpdate.findMany({
        where: {
          startupId,
          weekNumber: { lt: update.weekNumber },
        },
        orderBy: { weekNumber: "desc" },
        take: 4,
        include: { goals: true },
      });

      return {
        updates: previousUpdates.map((u) => ({
          weekNumber: u.weekNumber,
          primaryMetricValue: u.primaryMetricValue,
          primaryMetricDelta: u.primaryMetricDelta,
          usersTalkedTo: u.usersTalkedTo,
          moraleScore: u.moraleScore,
          goals: u.goals.map((g) => ({ completed: g.completed })),
        })),
      };
    });

    const taskSummary = await step.run("fetch-task-summary", async () => {
      const [allTasks, overdueTasks, upcomingTasks] = await Promise.all([
        db.task.findMany({
          where: { startupId },
          select: { status: true },
        }),
        db.task.count({
          where: {
            startupId,
            status: { not: "DONE" },
            deadline: { lt: new Date() },
          },
        }),
        db.task.count({
          where: {
            startupId,
            status: { not: "DONE" },
            deadline: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      const byStatus = {
        TODO: allTasks.filter((t) => t.status === "TODO").length,
        IN_PROGRESS: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
        BLOCKED: allTasks.filter((t) => t.status === "BLOCKED").length,
        DONE: allTasks.filter((t) => t.status === "DONE").length,
      };

      const completionRate =
        allTasks.length > 0 ? byStatus.DONE / allTasks.length : 0;

      return {
        totalTasks: allTasks.length,
        byStatus,
        overdueTasks,
        upcomingTasks,
        completionRate,
      };
    });

    const analysis = await step.run("run-analysis", async () => {
      return analyzeWeeklyUpdate(
        {
          weekNumber: update.weekNumber,
          isLaunched: update.isLaunched,
          weeksToLaunch: update.weeksToLaunch,
          usersTalkedTo: update.usersTalkedTo,
          userLearnings: update.userLearnings || "",
          primaryMetricType: update.primaryMetricType,
          primaryMetricValue: update.primaryMetricValue,
          primaryMetricDelta: update.primaryMetricDelta,
          metricPeriod: update.metricPeriod,
          customMetricName: update.customMetricName,
          additionalMetrics: update.additionalMetrics as Array<{
            type: string;
            value: number;
            period?: string | null;
            customMetricName?: string | null;
          }> | null,
          previousGoalsReview: update.previousGoalsReview as Array<{
            goalText: string;
            completed: boolean;
          }> | null,
          goalsCompletionRate: update.goalsCompletionRate,
          moraleScore: update.moraleScore,
          topImprovements: update.topImprovements,
          biggestObstacle: update.biggestObstacle,
          goals: update.goals.map((g) => ({
            content: g.content,
            priority: g.priority,
            completed: g.completed,
          })),
        },
        {
          name: update.startup.name,
          tagline: update.startup.tagline,
          description: update.startup.description,
          industry: update.startup.industry,
          stage: update.startup.stage,
          targetMarket: update.startup.targetMarket,
          currentWeekNumber: update.startup.currentWeekNumber,
        },
        {
          ...history,
          taskSummary,
        },
      );
    });

    await step.run("save-analysis", async () => {
      return db.weeklyUpdate.update({
        where: { id: updateId },
        data: {
          aiVerdict: analysis.verdict,
          aiAnalysis: {
            analysis: analysis.analysis,
            trajectory: analysis.trajectory,
            confidence: analysis.confidence,
          },
          aiRecommendations: analysis.recommendations,
        },
      });
    });

    return {
      updateId,
      verdict: analysis.verdict,
      confidence: analysis.confidence,
    };
  },
);
