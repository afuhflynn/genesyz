import { generateFollowerAnalysis } from "@/lib/agents/startup-coach";
import { db } from "@/lib/db";
import {
  sendFollowerWeeklyUpdateEmail,
  sendNewFollowerAddedEmail,
  sendTeamMemberAddedNotificationEmail,
} from "@/lib/email/send";
import { inngest } from "@/lib/inngest/client";

export const followerAddedFn = inngest.createFunction(
  {
    id: "follower-added",
    name: "Startup Follower Added Notification",
  },
  { event: "startup.follower.added" },
  async ({ event, step }) => {
    const { startupId, startupName, startupSlug, followerEmail, followerName } =
      event.data;

    await step.run("send-follower-welcome-email", async () => {
      await sendNewFollowerAddedEmail({
        to: followerEmail,
        followerName,
        startupName,
        startupSlug,
      });
    });

    return { sent: true, followerEmail, startupId };
  },
);

export const teamMemberAddedFn = inngest.createFunction(
  {
    id: "team-member-added-notification",
    name: "Team Member Added Notification",
  },
  { event: "startup.member.added" },
  async ({ event, step }) => {
    const {
      startupId,
      startupName,
      startupSlug,
      newMemberName,
      newMemberRole,
    } = event.data;

    const data = await step.run("fetch-team-members", async () => {
      const startup = await db.startup.findUnique({
        where: { id: startupId },
        include: {
          user: { select: { id: true, email: true, name: true } },
          members: {
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          },
        },
      });

      if (!startup) return null;

      const teamMembers = [
        { email: startup.user.email, name: startup.user.name },
        ...startup.members
          .filter((m) => m.user.email !== startup.user.email)
          .map((m) => ({ email: m.user.email, name: m.user.name })),
      ];

      return { teamMembers, startup };
    });

    if (!data) {
      throw new Error(`Startup ${startupId} not found`);
    }

    const { teamMembers } = data;

    await step.run("notify-team-members", async () => {
      const notifications = teamMembers.map((member) =>
        sendTeamMemberAddedNotificationEmail({
          to: member.email,
          userName: member.name || "Team Member",
          startupName,
          startupSlug,
          newMemberName,
          newMemberRole,
        }),
      );

      await Promise.allSettled(notifications);
    });

    return { notified: teamMembers.length, startupId };
  },
);

interface FollowerReportData {
  weekNumber: number;
  isLaunched: boolean;
  primaryMetricType: string;
  primaryMetricValue: number;
  primaryMetricDelta: number | null;
  metricPeriod?: string | null;
  metricFormat?: "CURRENCY" | "PERCENTAGE" | "NUMBER" | null;
  customMetricName?: string | null;
  usersTalkedTo: number;
  moraleScore: number;
  userLearnings: string;
  topImprovements?: string | null;
  biggestObstacle?: string | null;
  goals: Array<{ content: string; priority: number }>;
}

export const followerWeeklyUpdateFn = inngest.createFunction(
  {
    id: "follower-weekly-update-notification",
    name: "Follower Weekly Update Notification",
  },
  { event: "startup.weeklyUpdate.followerNotification" },
  async ({ event, step }) => {
    const { updateId, startupId } = event.data;

    const data = await step.run("fetch-data", async () => {
      const update = await db.weeklyUpdate.findUnique({
        where: { id: updateId },
        include: {
          startup: {
            include: {
              user: { select: { id: true, email: true, name: true } },
              members: {
                include: {
                  user: { select: { id: true, email: true, name: true } },
                },
              },
              followers: true,
            },
          },
        },
      });

      if (!update || !update.startup) return null;

      const previousUpdates = await db.weeklyUpdate.findMany({
        where: {
          startupId: update.startupId,
          weekNumber: { lt: update.weekNumber },
        },
        orderBy: { weekNumber: "desc" },
        take: 3,
      });

      return { update, startup: update.startup, previousUpdates };
    });

    if (!data) {
      throw new Error(`Update ${updateId} or startup not found`);
    }

    const { update, startup, previousUpdates } = data;

    const currentReport: FollowerReportData = {
      weekNumber: update.weekNumber,
      isLaunched: update.isLaunched,
      primaryMetricType: update.primaryMetricType,
      primaryMetricValue: update.primaryMetricValue,
      primaryMetricDelta: update.primaryMetricDelta,
      metricPeriod: update.metricPeriod,
      metricFormat: update.metricFormat as
        | "CURRENCY"
        | "PERCENTAGE"
        | "NUMBER"
        | null,
      customMetricName: update.customMetricName,
      usersTalkedTo: update.usersTalkedTo,
      moraleScore: update.moraleScore,
      userLearnings: update.userLearnings || "",
      topImprovements: update.topImprovements,
      biggestObstacle: update.biggestObstacle,
      goals: update.goals.map((g) => ({
        content: g.content,
        priority: g.priority,
      })),
    };

    const previousReports: FollowerReportData[] = previousUpdates.map((p) => ({
      weekNumber: p.weekNumber,
      isLaunched: p.isLaunched,
      primaryMetricType: p.primaryMetricType,
      primaryMetricValue: p.primaryMetricValue,
      primaryMetricDelta: p.primaryMetricDelta,
      metricPeriod: p.metricPeriod,
      metricFormat: p.metricFormat as
        | "CURRENCY"
        | "PERCENTAGE"
        | "NUMBER"
        | null,
      customMetricName: p.customMetricName,
      usersTalkedTo: p.usersTalkedTo,
      moraleScore: p.moraleScore,
      userLearnings: p.userLearnings || "",
      topImprovements: p.topImprovements,
      biggestObstacle: p.biggestObstacle,
      goals: [],
    }));

    const aiAnalysis = await step.run("generate-ai-analysis", async () => {
      try {
        return await generateFollowerAnalysis(
          currentReport,
          {
            name: startup.name,
            tagline: startup.tagline,
            description: startup.description,
            industry: startup.industry,
            stage: startup.stage,
          },
          previousReports.length > 0 ? previousReports : undefined,
        );
      } catch (error) {
        console.error(
          "[FOLLOWER_ANALYSIS] Failed to generate AI analysis:",
          error,
        );
        return null;
      }
    });

    const recipients = [
      { email: startup.user.email, name: startup.user.name },
      ...startup.members
        .filter((m) => m.user.email !== startup.user.email)
        .map((m) => ({ email: m.user.email, name: m.user.name })),
      ...startup.followers.map((f) => ({ email: f.email, name: f.name })),
    ];

    const uniqueRecipients = recipients.filter(
      (r, index, self) => self.findIndex((t) => t.email === r.email) === index,
    );

    await step.run("send-emails", async () => {
      const emails = uniqueRecipients.map((recipient) =>
        sendFollowerWeeklyUpdateEmail({
          to: recipient.email,
          followerName: recipient.name,
          startupName: startup.name,
          startupSlug: startup.slug,
          currentReport,
          previousReports:
            previousReports.length > 0 ? previousReports : undefined,
          aiAnalysis: aiAnalysis || undefined,
        }),
      );

      await Promise.allSettled(emails);
    });

    return {
      sent: uniqueRecipients.length,
      startupId,
      updateId,
      weekNumber: update.weekNumber,
    };
  },
);
