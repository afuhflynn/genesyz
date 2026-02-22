import { db } from "@/lib/db";
import { sendStartupFeatureAnnouncementEmail } from "@/lib/email/send";
import { inngest } from "@/lib/inngest/client";

export const sendStartupFeatureAnnouncement = inngest.createFunction(
  {
    id: "send-startup-feature-announcement",
    name: "Send Startup Feature Announcement",
  },
  { event: "announcement.startupFeature" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const user = await step.run("fetch-user", async () => {
      return db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    await step.run("send-email", async () => {
      await sendStartupFeatureAnnouncementEmail({
        to: user.email,
        userName: user.name || "there",
      });
    });

    return { sent: true, userId };
  },
);

export const broadcastStartupFeatureAnnouncement = inngest.createFunction(
  {
    id: "broadcast-startup-feature-announcement",
    name: "Broadcast Startup Feature Announcement to All Users",
  },
  { event: "announcement.startupFeature.broadcast" },
  async ({ step }) => {
    const users = await step.run("fetch-all-users", async () => {
      return db.user.findMany({
        where: {
          emailVerified: true,
        },
        select: { id: true },
      });
    });

    const events = users.map((user) => ({
      name: "announcement.startupFeature" as const,
      data: { userId: user.id },
    }));

    if (events.length > 0) {
      await step.sendEvent("send-announcements", events);
    }

    return {
      announcementSent: events.length,
      timestamp: new Date().toISOString(),
    };
  },
);
