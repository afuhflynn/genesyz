import { db } from "@/lib/db";
import { sendWeeklyUpdateReminderEmail } from "@/lib/email/send";
import { getWeekStartForDate, getWeeksSinceCreation } from "@/lib/utils/date";
import { inngest } from "../client";

export const weeklyUpdateReminderFn = inngest.createFunction(
  {
    id: "weekly-update-reminder",
    name: "Weekly Update Reminder Email",
    triggers: { event: "startup.weeklyReminder" },
  },
  async ({ event, step }) => {
    const { startupId, userId, reminderDay } = event.data;

    const data = await step.run("fetch-startup-user", async () => {
      const startup = await db.startup.findUnique({
        where: { id: startupId },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          isActive: true,
          weeklyUpdates: {
            where: {
              weekStart: getWeekStartForDate(new Date()),
            },
            select: { id: true },
          },
        },
      });

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true, emailNotifications: true },
      });

      return { startup, user };
    });

    if (!data.startup || !data.user) {
      return { skipped: true, reason: "Startup or user not found" };
    }

    if (!data.startup.isActive) {
      return { skipped: true, reason: "Startup is not active" };
    }

    if (data.startup.weeklyUpdates.length > 0) {
      return { skipped: true, reason: "Weekly update already submitted" };
    }

    if (!data.user.email || !data.user.emailNotifications) {
      return {
        skipped: true,
        reason: "User has no email or notifications disabled",
      };
    }

    const userEmail = data.user.email;
    const userName = data.user.name || "Founder";
    const startupName = data.startup.name;
    const startupSlug = data.startup.slug;
    const weekNumber = getWeeksSinceCreation(new Date(data.startup.createdAt));

    await step.run("send-reminder-email", async () => {
      await sendWeeklyUpdateReminderEmail({
        to: userEmail,
        userName,
        startupName,
        startupSlug,
        weekNumber,
        reminderDay,
      });
    });

    await step.run("create-feed-item", async () => {
      const idempotencyKey = `weekly-reminder-${data.startup!.id}-${weekNumber}-${reminderDay}`;
      await db.researchFeedItem.upsert({
        where: { idempotencyKey },
        create: {
          startupId: data.startup!.id,
          type: "WEEKLY_REMINDER",
          title: `Reminder: Week ${weekNumber} Update`,
          summary: `Time to submit your weekly update for ${startupName}.`,
          idempotencyKey,
          content: {
            weekNumber,
            reminderDay,
          },
        },
        update: {
          summary: `Time to submit your weekly update for ${startupName}.`,
          content: {
            weekNumber,
            reminderDay,
          },
        },
      });
    });

    return {
      sent: true,
      startupId,
      userId,
      reminderDay,
    };
  },
);

export const weeklyUpdateReminderCronFriday = inngest.createFunction(
  {
    id: "weekly-update-reminder-cron-friday",
    name: "Weekly Update Reminder Cron (Friday 17:00 UTC)",
    triggers: { cron: "0 17 * * 5" },
  },
  async ({ step }) => {
    const startupsNeedingReminder = await step.run(
      "fetch-startups-without-update",
      async () => {
        const currentWeekStart = getWeekStartForDate(new Date());

        const startups = await db.startup.findMany({
          where: {
            isActive: true,
            NOT: {
              weeklyUpdates: {
                some: {
                  weekStart: currentWeekStart,
                },
              },
            },
          },
          select: {
            id: true,
            userId: true,
            name: true,
          },
        });

        return startups;
      },
    );

    if (startupsNeedingReminder.length === 0) {
      return { remindersTriggered: 0 };
    }

    const events = startupsNeedingReminder.map((s) => ({
      name: "startup.weeklyReminder" as const,
      data: {
        startupId: s.id,
        userId: s.userId,
        reminderDay: "friday" as const,
      },
    }));

    await step.sendEvent("send-friday-reminders", events);

    await step.run("log-friday-reminders", async () => {
      await db.auditLog.create({
        data: {
          action: "weekly_reminder.friday_sent",
          resource: "email",
          metadata: {
            count: events.length,
            startupIds: startupsNeedingReminder.map((s) => s.id),
          },
        },
      });
    });

    return { remindersTriggered: events.length };
  },
);

export const weeklyUpdateReminderCronSaturday = inngest.createFunction(
  {
    id: "weekly-update-reminder-cron-saturday",
    name: "Weekly Update Reminder Cron (Saturday 17:00 UTC)",
    triggers: { cron: "0 17 * * 6" },
  },
  async ({ step }) => {
    const startupsNeedingReminder = await step.run(
      "fetch-startups-without-update",
      async () => {
        const currentWeekStart = getWeekStartForDate(new Date());

        const startups = await db.startup.findMany({
          where: {
            isActive: true,
            NOT: {
              weeklyUpdates: {
                some: {
                  weekStart: currentWeekStart,
                },
              },
            },
          },
          select: {
            id: true,
            userId: true,
            name: true,
          },
        });

        return startups;
      },
    );

    if (startupsNeedingReminder.length === 0) {
      return { remindersTriggered: 0 };
    }

    const events = startupsNeedingReminder.map((s) => ({
      name: "startup.weeklyReminder" as const,
      data: {
        startupId: s.id,
        userId: s.userId,
        reminderDay: "saturday" as const,
      },
    }));

    await step.sendEvent("send-saturday-reminders", events);

    await step.run("log-saturday-reminders", async () => {
      await db.auditLog.create({
        data: {
          action: "weekly_reminder.saturday_sent",
          resource: "email",
          metadata: {
            count: events.length,
            startupIds: startupsNeedingReminder.map((s) => s.id),
          },
        },
      });
    });

    return { remindersTriggered: events.length };
  },
);
