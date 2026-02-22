import { db } from "@/lib/db";
import { sendStartupWeeklyReportEmail } from "@/lib/email/send";
import { inngest } from "@/lib/inngest/client";

interface AdditionalMetric {
  type: string;
  value: number;
  period?: string | null;
  customMetricName?: string | null;
}

interface PreviousGoalReview {
  goalText: string;
  completed: boolean;
}

export const weeklyStartupReportFn = inngest.createFunction(
  {
    id: "weekly-startup-report",
    name: "Weekly Startup Report Email",
  },
  { event: "startup.weeklyReport" },
  async ({ event, step }) => {
    const { startupId } = event.data;

    const data = await step.run("fetch-data", async () => {
      if (!startupId) {
        throw new Error("Startup ID is required");
      }
      const startup = await db.startup.findUnique({
        where: { id: startupId },
        include: {
          user: { select: { email: true, name: true } },
          weeklyUpdates: {
            orderBy: { weekStart: "desc" },
            take: 5,
            include: { goals: true },
          },
        },
      });

      if (!startup || !startup.user) return null;

      return { startup, user: startup.user };
    });

    if (!data) {
      throw new Error(`Startup ${startupId} or user not found`);
    }

    const { startup, user } = data;
    const latestUpdate = startup.weeklyUpdates[0];

    if (!latestUpdate) {
      return { skipped: true, reason: "No weekly updates" };
    }

    await step.run("send-email", async () => {
      await sendStartupWeeklyReportEmail({
        to: user.email,
        userName: user.name || "Founder",
        startupName: startup.name,
        startupSlug: startup.slug,
        report: {
          weekNumber: latestUpdate.weekNumber,
          isLaunched: latestUpdate.isLaunched,
          primaryMetricType: latestUpdate.primaryMetricType,
          primaryMetricValue: latestUpdate.primaryMetricValue,
          primaryMetricDelta: latestUpdate.primaryMetricDelta,
          metricPeriod: latestUpdate.metricPeriod,
          metricFormat: latestUpdate.metricFormat as
            | "CURRENCY"
            | "PERCENTAGE"
            | "NUMBER"
            | null,
          customMetricName: latestUpdate.customMetricName,
          additionalMetrics: latestUpdate.additionalMetrics as
            | AdditionalMetric[]
            | null,
          usersTalkedTo: latestUpdate.usersTalkedTo,
          moraleScore: latestUpdate.moraleScore,
          previousGoalsReview: latestUpdate.previousGoalsReview as
            | PreviousGoalReview[]
            | null,
          goalsCompletionRate: latestUpdate.goalsCompletionRate,
          aiVerdict: latestUpdate.aiVerdict,
          aiAnalysis: (latestUpdate.aiAnalysis as {
            positives?: string[];
            concerns?: string[];
          }) || { positives: [], concerns: [] },
          aiTrajectory:
            (
              latestUpdate.aiAnalysis as {
                trajectory?: { summary?: string };
              }
            )?.trajectory || {},
          aiRecommendations: (latestUpdate.aiRecommendations as string[]) || [],
        },
      });
    });

    return { sent: true, startupId, weekNumber: latestUpdate.weekNumber };
  },
);

export const weeklyStartupReportCron = inngest.createFunction(
  {
    id: "weekly-startup-report-cron",
    name: "Weekly Startup Report Cron (Sundays 9 AM UTC)",
  },
  { cron: "0 9 * * 0" },
  async ({ step }) => {
    const startups = await step.run("fetch-active-startups", async () => {
      return db.startup.findMany({
        where: {
          isActive: true,
          lastUpdateAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true, userId: true },
      });
    });

    const events = startups.map((s) => ({
      name: "startup.weeklyReport" as const,
      data: { startupId: s.id, userId: s.userId },
    }));

    if (events.length > 0) {
      await step.sendEvent("send-reports", events);
    }

    return { reportsTriggered: events.length };
  },
);
