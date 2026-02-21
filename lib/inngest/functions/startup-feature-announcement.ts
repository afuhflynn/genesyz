import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { inngest } from "@/lib/inngest/client";

const STARTUP_FEATURE_ANNOUNCEMENT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Feature: Startup Profiles</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px 24px; text-align: center;">
      <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; padding: 16px; margin-bottom: 16px;">
        <span style="font-size: 32px;">🚀</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Introducing Startup Profiles</h1>
      <p style="margin: 12px 0 0; opacity: 0.9; font-size: 16px;">Your validated ideas just got more powerful</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
        Hi {{name}},
      </p>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
        We've been working on something exciting. Today, we're launching <strong>Startup Profiles</strong> — 
        a new way to turn your validated ideas into active, trackable startups.
      </p>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">What's Included</h2>
        
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">📊</span>
            <div>
              <strong style="color: #0f172a;">Weekly KPI Tracking</strong>
              <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Track your primary metrics week over week with custom KPIs</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">🤖</span>
            <div>
              <strong style="color: #0f172a;">AI Coaching</strong>
              <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Get blunt, honest feedback and recommendations every week</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">📚</span>
            <div>
              <strong style="color: #0f172a;">Startup School</strong>
              <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Curated learning resources (coming soon)</p>
            </div>
          </div>
        </div>

        <div>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px;">🤝</span>
            <div>
              <strong style="color: #0f172a;">Co-Founder Match</strong>
              <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Find your perfect co-founder (coming soon)</p>
            </div>
          </div>
        </div>
      </div>

      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
        Converting an idea to a startup takes seconds. Just open any researched idea and click 
        "Create Startup Profile" to get started.
      </p>

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{appUrl}}/ideas" 
           style="display: inline-block; background: #0f172a; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Create Your First Startup Profile
        </a>
      </div>

      <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; text-align: center;">
        Best,<br>The IdeasVault Team
      </p>
    </div>
  </div>
</body>
</html>
`;

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const html = STARTUP_FEATURE_ANNOUNCEMENT_HTML.replace(
      /{{name}}/g,
      user.name || "Founder",
    ).replace(/{{appUrl}}/g, appUrl);

    await step.run("send-email", async () => {
      await sendEmail({
        to: user.email,
        subject: "🚀 New Feature: Turn Your Ideas into Startups",
        html,
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
