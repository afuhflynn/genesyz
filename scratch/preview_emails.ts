/**
 * Email template preview generator.
 * Uses the PREVIEW_EMAILS_DIR env var hook in lib/email/client.ts to
 * save every email as an HTML file for visual inspection.
 *
 * Run from project root:
 *   npx tsx scratch/preview_emails.ts
 */
process.env.PREVIEW_EMAILS_DIR =
  "/home/afuhflynn/.gemini/antigravity-cli/brain/d3f8b9d1-874b-48e0-83e1-f5437c594484/scratch/previews";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_NAME = "Genesyz";

import {
  sendWelcomeEmail,
  sendDigestEmail,
  sendWeeklyStrategicReportEmail,
  sendResearchCompleteEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
  sendWeeklyUpdateReminderEmail,
  sendStartupFeatureAnnouncementEmail,
  sendStartupWeeklyReportEmail,
  sendStartupMemberInvitedEmail,
  sendStartupMemberRoleChangedEmail,
  sendNewFollowerAddedEmail,
  sendTeamMemberAddedNotificationEmail,
  sendFollowerWeeklyUpdateEmail,
} from "../lib/email/send";

const TO = "founder@example.com";
const NAME = "Alice Founder";
const STARTUP = "GrowthOS";
const SLUG = "growthos";
const APP = "http://localhost:3000";

const mockReport = {
  weekNumber: 4,
  isLaunched: false,
  primaryMetricType: "REVENUE",
  primaryMetricValue: 12000,
  primaryMetricDelta: 1500,
  metricPeriod: "weekly",
  metricFormat: "CURRENCY" as const,
  customMetricName: null,
  additionalMetrics: null,
  usersTalkedTo: 14,
  moraleScore: 9,
  previousGoalsReview: [
    { goalText: "Launch landing page", completed: true },
    { goalText: "Interview 10 users", completed: true },
  ],
  goalsCompletionRate: 100,
  aiVerdict: "ON_TRACK",
  aiAnalysis: {
    positives: ["Revenue up 14% WoW", "Morale strong at 9/10"],
    concerns: ["Runway under 6 months at current burn"],
  },
  aiTrajectory: { summary: "Trending upward with strong WoW growth." },
  aiRecommendations: [
    "Follow up with the 5 beta users.",
    "Polish the payment checkout page.",
    "Draft investor update for seed round.",
  ],
};

const mockFollowerReport = {
  weekNumber: 4,
  isLaunched: false,
  primaryMetricType: "REVENUE",
  primaryMetricValue: 12000,
  primaryMetricDelta: 1500,
  metricPeriod: "weekly",
  metricFormat: "CURRENCY" as const,
  customMetricName: null,
  usersTalkedTo: 14,
  moraleScore: 9,
  userLearnings: "SaaS founders prefer Slack integrations over web apps.",
  topImprovements: "Checkout flow conversion improved by 18%.",
  biggestObstacle: "Engineer capacity is a bottleneck.",
  goals: [
    { content: "Launch landing page", priority: 1 },
    { content: "Interview 10 users", priority: 2 },
  ],
};

const mockFollowerPrevious = [
  { ...mockFollowerReport, weekNumber: 2, primaryMetricValue: 8000, primaryMetricDelta: null },
  { ...mockFollowerReport, weekNumber: 3, primaryMetricValue: 10500, primaryMetricDelta: 2500 },
];

const mockAiAnalysis = {
  summary: "Consistent growth month over month. Excellent feedback loops.",
  comparisonWithPrevious: ["Revenue up 14% since week 3.", "Morale stable at 9/10."],
  immediateActions: ["Follow up with 5 beta users.", "Polish checkout page."],
};

async function run() {
  const dir = process.env.PREVIEW_EMAILS_DIR!;
  // Clear previous previews
  const fs = await import("node:fs");
  if (fs.existsSync(dir)) fs.readdirSync(dir).forEach((f) => fs.unlinkSync(`${dir}/${f}`));

  console.log(`\nGenerating email previews → ${dir}\n`);

  await sendWelcomeEmail({ to: TO, userName: NAME });
  await sendDigestEmail({
    to: TO, userName: NAME, totalIdeas: 8, averageScore: 78,
    topIdeas: [
      { id: "1", title: "AI Fridge Scanner", score: 92 },
      { id: "2", title: "Automated Tax Planner", score: 81 },
    ],
  });
  await sendWeeklyStrategicReportEmail({
    to: TO, userName: NAME,
    advisory: {
      executiveSummary: "GrowthOS shows strong market validation signals this week.",
      primaryFocus: { ideaTitle: "Co-Founder Sourcing Strategy", allocation: 60 },
      actionPlan: [
        { action: "Post co-founder listing", owner: "Alice", due: "2026-07-25", priority: "High" },
        { action: "Schedule interviews", owner: "Bob", due: "2026-07-28", priority: "Medium" },
      ],
      vcCorner: { sentiment: "Investors want technical founding teams.", investmentPotential: "high" },
      verdicts: [{ title: "Validation", verdict: "excellent", rationale: "Strong WTP signals." }],
      riskCliffs: [{ title: "Team Risk", risk: "Dependent on single lead dev." }],
    } as never,
  });
  await sendResearchCompleteEmail({
    to: TO, userName: NAME, ideaTitle: "AI Recipe Planner",
    ideaId: "recipe-planner-123", overallScore: 88, verdict: "pursue-immediately",
  });
  await sendVerificationEmail({ to: TO, userName: NAME, code: "882103", url: `${APP}/verify-email` });
  await sendPasswordResetEmail({ to: TO, userName: NAME, url: `${APP}/reset-password?token=abc123` });
  await sendMagicLinkEmail({ to: TO, url: `${APP}/api/auth/magic-link?token=abc123` });
  await sendWeeklyUpdateReminderEmail({
    to: TO, userName: NAME, startupName: STARTUP, startupSlug: SLUG, weekNumber: 4, reminderDay: "friday",
  });
  await sendStartupFeatureAnnouncementEmail({ to: TO, userName: NAME });
  await sendStartupWeeklyReportEmail({
    to: TO, userName: NAME, startupName: STARTUP, startupSlug: SLUG, report: mockReport,
  });
  await sendStartupMemberInvitedEmail({
    to: TO, userName: "Bob Cofounder", inviterName: NAME,
    startupName: STARTUP, startupSlug: SLUG, role: "Co-Founder",
  });
  await sendStartupMemberRoleChangedEmail({
    to: TO, userName: "Bob Cofounder", startupName: STARTUP, startupSlug: SLUG,
    oldRole: "Member", newRole: "Lead Admin", changedByName: NAME,
  });
  await sendNewFollowerAddedEmail({ to: TO, followerName: "Investor Jane", startupName: STARTUP, startupSlug: SLUG });
  await sendTeamMemberAddedNotificationEmail({
    to: TO, userName: NAME, startupName: STARTUP, startupSlug: SLUG,
    newMemberName: "Bob Cofounder", newMemberRole: "Co-Founder",
  });
  await sendFollowerWeeklyUpdateEmail({
    to: "investor@example.com", followerName: "Investor Jane",
    startupName: STARTUP, startupSlug: SLUG,
    currentReport: mockFollowerReport,
    previousReports: mockFollowerPrevious,
    aiAnalysis: mockAiAnalysis,
  });

  const count = fs.readdirSync(dir).length;
  console.log(`\n✅ Done — ${count}/15 emails saved\n`);
  if (count < 15) process.exit(1);
}

run().catch((err) => {
  console.error("\n❌ Preview failed:", err);
  process.exit(1);
});
