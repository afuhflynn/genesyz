import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { inngest } from "@/lib/inngest/client";

const FEATURE_ANNOUNCEMENT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>What's New | IdeasVault Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: #0f172a; color: white; padding: 32px 24px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">What's New at IdeasVault</h1>
      <p style="margin: 8px 0 0; opacity: 0.8; font-size: 15px;">Enhanced metrics, goal tracking, and more</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
        Hi {{name}},
      </p>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
        We've shipped some significant improvements to Startup Profiles. Here's what's new:
      </p>

      <!-- New Metrics Section - Highlighted -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 17px; color: #166534;">Enhanced Metrics Tracking</h2>
        
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5; color: #374151;">
          Your weekly updates just got more powerful. You can now track metrics the way that makes sense for your startup:
        </p>
        
        <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
          <li><strong>35+ categorized metrics</strong> — Revenue, engagement, marketplace, growth metrics and more</li>
          <li><strong>Smart formatting</strong> — Currency shows as $1,234, percentages as 15.5%</li>
          <li><strong>Flexible periods</strong> — Track daily, weekly, monthly, quarterly, or yearly</li>
          <li><strong>Additional metrics</strong> — Add up to 5 extra metrics per update</li>
          <li><strong>Custom metrics</strong> — Define your own when standard ones don't fit</li>
        </ul>
      </div>

      <!-- Goal Review Section -->
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px; font-size: 17px; color: #92400e;">Goal Completion Review</h2>
        
        <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
          Each week, you'll now review last week's goals with simple checkboxes. See your completion rate (e.g., "2/3 completed, 67%") and the AI coach factors this into its analysis.
        </p>
      </div>

      <!-- Existing Features Recap -->
      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 17px; color: #0f172a;">Platform Features</h2>
        
        <div style="margin-bottom: 20px;">
          <strong style="color: #0f172a; font-size: 15px;">Ideas Validation</strong>
          <ul style="margin: 8px 0 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.7;">
            <li>AI-powered market, competitor, and feasibility research</li>
            <li>Multi-dimensional scoring (Clarity, Market, Execution)</li>
            <li>Conversational AI Guide for deeper exploration</li>
            <li>PDF export for sharing</li>
          </ul>
        </div>
        
        <div>
          <strong style="color: #0f172a; font-size: 15px;">Startup Tracking</strong>
          <ul style="margin: 8px 0 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.7;">
            <li>Weekly progress updates with launch status tracking</li>
            <li>AI coaching with blunt, honest feedback</li>
            <li>Metrics dashboard with trends and history</li>
            <li>User conversation tracking for pre-launch startups</li>
          </ul>
        </div>
      </div>

      <!-- Coming Soon -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Coming Soon</p>
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          Startup School (curated learning resources) and Co-Founder Match
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; padding-top: 8px;">
        <a href="{{appUrl}}/startups" 
           style="display: inline-block; background: #0f172a; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 15px;">
          View Your Startups
        </a>
      </div>

      <p style="margin: 32px 0 0; font-size: 14px; color: #64748b; text-align: center;">
        — The IdeasVault Team
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

    const html = FEATURE_ANNOUNCEMENT_HTML.replace(
      /{{name}}/g,
      user.name || "there",
    ).replace(/{{appUrl}}/g, appUrl);

    await step.run("send-email", async () => {
      await sendEmail({
        to: user.email,
        subject:
          "What's New: Enhanced Metrics & Goal Tracking | IdeasVault Update",
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
