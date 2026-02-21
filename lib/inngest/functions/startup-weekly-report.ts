import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { inngest } from "@/lib/inngest/client";

const VERDICT_STYLES: Record<string, { color: string; label: string }> = {
  ON_TRACK: { color: "#16a34a", label: "On Track" },
  NEEDS_ATTENTION: { color: "#ca8a04", label: "Needs Attention" },
  AT_RISK: { color: "#dc2626", label: "At Risk" },
};

function generateEmailHtml(
  startup: { name: string; slug: string },
  update: {
    weekNumber: number;
    primaryMetricType: string;
    primaryMetricValue: number;
    primaryMetricDelta: number | null;
    usersTalkedTo: number;
    moraleScore: number;
    aiVerdict: string | null;
    aiAnalysis: any;
    aiRecommendations: string[];
  },
): string {
  const verdict = update.aiVerdict ? VERDICT_STYLES[update.aiVerdict] : null;
  const metricDelta = update.primaryMetricDelta;
  const metricDeltaDisplay =
    metricDelta !== null
      ? `${metricDelta >= 0 ? "+" : ""}${metricDelta.toFixed(1)}`
      : "No change";

  const analysis = update.aiAnalysis?.analysis || {};
  const trajectory = update.aiAnalysis?.trajectory || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${startup.name} - Weekly Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #0f172a; color: white; padding: 24px;">
      <h1 style="margin: 0; font-size: 24px;">${startup.name}</h1>
      <p style="margin: 8px 0 0; opacity: 0.8;">Week ${update.weekNumber} Report</p>
    </div>

    ${
      verdict
        ? `<div style="background: ${verdict.color}15; border-left: 4px solid ${verdict.color}; padding: 16px 24px;">
      <div style="font-weight: 600; color: ${verdict.color}; font-size: 14px; text-transform: uppercase;">${verdict.label}</div>
    </div>`
        : ""
    }

    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">This Week's Numbers</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">${update.primaryMetricType.replace(/_/g, " ")}</div>
          <div style="font-size: 24px; font-weight: 600; color: #0f172a;">${update.primaryMetricValue}</div>
          <div style="font-size: 12px; color: ${metricDelta && metricDelta >= 0 ? "#16a34a" : "#dc2626"};">${metricDeltaDisplay}</div>
        </div>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Users Talked To</div>
          <div style="font-size: 24px; font-weight: 600; color: #0f172a;">${update.usersTalkedTo}</div>
        </div>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Morale</div>
          <div style="font-size: 24px; font-weight: 600; color: #0f172a;">${update.moraleScore}/10</div>
        </div>
      </div>
    </div>

    ${
      analysis.positives?.length
        ? `<div style="padding: 0 24px 24px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #16a34a;">What's Working</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${analysis.positives.map((p: string) => `<li style="margin-bottom: 8px;">${p}</li>`).join("")}
      </ul>
    </div>`
        : ""
    }

    ${
      analysis.concerns?.length
        ? `<div style="padding: 0 24px 24px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #ca8a04;">Watch Out</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${analysis.concerns.map((c: string) => `<li style="margin-bottom: 8px;">${c}</li>`).join("")}
      </ul>
    </div>`
        : ""
    }

    ${
      trajectory.summary
        ? `<div style="padding: 0 24px 24px; background: #fef3c7; margin: 0 24px; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 8px; font-size: 14px; color: #92400e;">Is It Going To Work?</h3>
      <p style="margin: 0; font-size: 14px; color: #78350f;">${trajectory.summary}</p>
    </div>`
        : ""
    }

    ${
      update.aiRecommendations?.length
        ? `<div style="padding: 24px; background: #f8fafc;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">Next Week's Focus</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${update.aiRecommendations
          .slice(0, 3)
          .map((r: string) => `<li style="margin-bottom: 8px;">${r}</li>`)
          .join("")}
      </ul>
    </div>`
        : ""
    }

    <div style="padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/startups/${startup.slug}" 
         style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
        View Full Dashboard
      </a>
    </div>
  </div>
</body>
</html>`;
}

export const weeklyStartupReportFn = inngest.createFunction(
  {
    id: "weekly-startup-report",
    name: "Weekly Startup Report Email",
  },
  { event: "startup.weeklyReport" },
  async ({ event, step }) => {
    const { startupId, userId } = event.data;

    const data = await step.run("fetch-data", async () => {
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

    const emailHtml = generateEmailHtml(
      { name: startup.name, slug: startup.slug },
      {
        weekNumber: latestUpdate.weekNumber,
        primaryMetricType: latestUpdate.primaryMetricType,
        primaryMetricValue: latestUpdate.primaryMetricValue,
        primaryMetricDelta: latestUpdate.primaryMetricDelta,
        usersTalkedTo: latestUpdate.usersTalkedTo,
        moraleScore: latestUpdate.moraleScore,
        aiVerdict: latestUpdate.aiVerdict,
        aiAnalysis: latestUpdate.aiAnalysis,
        aiRecommendations: (latestUpdate.aiRecommendations as string[]) || [],
      },
    );

    await step.run("send-email", async () => {
      await sendEmail({
        to: user.email,
        subject: `${startup.name} Weekly Report - Week ${latestUpdate.weekNumber}`,
        html: emailHtml,
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
