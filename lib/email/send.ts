import type { StrategicAdvisory } from "../agents/types";
import { sendEmail } from "./client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ===========================================
// Shared Premium Layout
// ===========================================

function renderPremiumEmail(options: {
  title: string;
  previewTextText?: string;
  contentHtml: string;
  footerHtml?: string;
  badge?: string;
}) {
  const { title, previewTextText, contentHtml, footerHtml, badge } = options;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  ${
    previewTextText
      ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewTextText}</div>`
      : ""
  }
  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: #0f172a; padding: 32px; text-align: center; color: #ffffff;">
      <img src="${APP_URL}/images/logo/logo-email-white.png" alt="IdeasVault" width="120" style="margin-bottom: 16px;">
      ${
        badge
          ? `
      <div style="display: inline-block; padding: 2px 10px; background: rgba(245, 166, 35, 0.2); border: 1px solid #F5A623; border-radius: 9999px; margin-bottom: 8px;">
        <span style="font-size: 10px; font-weight: 800; color: #F5A623; text-transform: uppercase; letter-spacing: 0.05em;">${badge}</span>
      </div>`
          : ""
      }
      <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #ffffff;">${title}</h1>
    </div>

    <div style="padding: 32px;">
      ${contentHtml}
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 11px; color: #94a3b8;">
      © ${new Date().getFullYear()} IdeasVault. ${
        footerHtml ||
        `<a href="${APP_URL}/settings" style="color: #64748b; text-decoration: underline;">Manage Preferences</a>`
      }
    </p>
  </div>
</body>
</html>
  `;
}

// ===========================================
// Welcome Email
// ===========================================

export async function sendWelcomeEmail(options: {
  to: string;
  userName: string;
}): Promise<boolean> {
  const { to, userName } = options;

  const contentHtml = `
    <h2 style="font-size: 24px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
      Welcome, ${userName}!
    </h2>

    <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
      Thank you for joining IdeasVault. We're excited to help you capture, research, and validate your startup ideas.
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
        Here's what you can do:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">Capture ideas via text, voice, or images</li>
        <li style="margin-bottom: 8px;">Get AI-powered market research</li>
        <li style="margin-bottom: 8px;">Receive actionable insights and scores</li>
        <li style="margin-bottom: 8px;">Export research as professional PDFs</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        Go to Dashboard
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Welcome to IdeasVault",
    contentHtml,
    badge: "Welcome",
  });

  return sendEmail({
    to,
    subject: "Welcome to IdeasVault!",
    html,
    text: `Welcome to IdeasVault, ${userName}! Visit ${APP_URL}/dashboard to get started.`,
  });
}

// ===========================================
// Weekly Digest Email
// ===========================================

export interface DigestIdeaSummary {
  id: string;
  title: string;
  score: number;
}

export async function sendDigestEmail(options: {
  to: string;
  userName: string;
  totalIdeas: number;
  averageScore: number;
  topIdeas: DigestIdeaSummary[];
}): Promise<boolean> {
  const { to, userName, totalIdeas, averageScore, topIdeas } = options;

  const topIdeasHtml = topIdeas
    .map(
      (idea) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <a href="${APP_URL}/ideas/${
              idea.id
            }" style="color: #0f172a; text-decoration: none; font-weight: 600;">
              ${idea.title}
            </a>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right;">
            <span style="display: inline-block; background: ${
              idea.score >= 70
                ? "#dcfce7"
                : idea.score >= 50
                  ? "#fef3c7"
                  : "#fee2e2"
            }; color: ${
              idea.score >= 70
                ? "#166534"
                : idea.score >= 50
                  ? "#a16207"
                  : "#dc2626"
            }; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800;">
              ${idea.score}
            </span>
          </td>
        </tr>
      `,
    )
    .join("");

  const contentHtml = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 24px;">
      Hi ${userName}, here's your weekly update
    </h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="font-size: 32px; font-weight: 800; color: #F5A623; margin: 0;">${totalIdeas}</p>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Active Ideas</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="font-size: 32px; font-weight: 800; color: #F5A623; margin: 0;">${averageScore}</p>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Avg Score</p>
      </div>
    </div>

    ${
      topIdeas.length > 0
        ? `
      <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 16px; text-transform: uppercase;">
        Your Top Ideas
      </h3>
      <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <tbody>
          ${topIdeasHtml}
        </tbody>
      </table>
    `
        : `
      <div style="background: #f8fafc; border-radius: 12px; padding: 32px; text-align: center; border: 1px dashed #cbd5e1;">
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          No ideas yet. <a href="${APP_URL}/ideas/new" style="color: #F5A623; font-weight: 700;">Capture your first idea</a>
        </p>
      </div>
    `
    }

    <div style="text-align: center; margin-top: 32px;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Dashboard
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Weekly Digest",
    contentHtml,
    badge: "Weekly Update",
  });

  return sendEmail({
    to,
    subject: `Your Weekly IdeasVault Digest - ${totalIdeas} ideas, avg score ${averageScore}`,
    html,
    text: `Hi ${userName}, you have ${totalIdeas} active ideas with an average score of ${averageScore}. Visit ${APP_URL}/dashboard to see more.`,
  });
}

export async function sendWeeklyStrategicReportEmail(options: {
  to: string;
  userName: string;
  advisory: StrategicAdvisory;
}): Promise<boolean> {
  const { to, userName, advisory } = options;

  const primaryFocus = advisory.primaryFocus || {
    ideaTitle: "Your Top Idea",
    allocation: 60,
  };
  const marketPulse = advisory.marketPulse?.slice(0, 3) || [];
  const vcCorner = advisory.vcCorner || {};
  const riskCliffs = advisory.riskCliffs || [];
  const actionPlan = advisory.weeklyActionPlan || [];
  const totalIdeas = advisory.verdicts?.length || 0;
  const topIdeas = advisory.verdicts?.slice(0, 3) || [];

  // Get current date for the brief
  const now = new Date();
  const weekNumber = Math.ceil(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );

  // Generate subject line variants for The Catalyst Brief
  const subjectVariants = [
    `Your Catalyst Brief: ${primaryFocus.ideaTitle} leads with momentum`,
    `The Catalyst Brief Week ${weekNumber}: Portfolio momentum check`,
    `Your Catalyst Brief: Strategic priorities for ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  ];

  // Generate preheader variants
  const preheaderVariants = [
    `Portfolio: ${totalIdeas} ideas • Primary focus: ${primaryFocus.ideaTitle} (${primaryFocus.allocation}%)`,
    `VC Corner: ${vcCorner.sentiment ? "Market analysis ready" : "Strategic insights inside"}`,
    `Action required: ${actionPlan.filter((a) => a.priority === "High").length} high-priority tasks`,
  ];

  // Generate Markdown version
  const markdownContent = `
# Founder Focus This Week

## ${primaryFocus.ideaTitle} — ${primaryFocus.allocation}% time allocation

### Executive Summary
${advisory.executiveSummary}

### Market Pulse
${marketPulse.map((item) => `- ${item.newsItem}`).join("\n")}

### Strategic Roadmap
${advisory.verdicts
  .map((verdict) => {
    return `#### ${verdict.ideaTitle}
- ${verdict.onePriority}
- Status: ${verdict.status || "validation"}
- Allocation: ${verdict.timeAllocation || 20}%
`;
  })
  .join("")}

### Weekly Action Plan
${actionPlan
  .map((action) => {
    return `- **${action.title}** (${action.priority})
  - Owner: ${action.owner}
  - Due: ${action.due_date}
  - Time: ${action.estimated_time_allocation}
  - Success: ${action.success_criteria}
  - Kill: ${action.kill_criteria}
`;
  })
  .join("")}

### VC Corner
${vcCorner.sentiment}

**Investor Angle:** ${vcCorner.investorAngle}

### Why This Might Fail
${riskCliffs.map((risk) => `- **${risk.ideaTitle}:** ${risk.failureReason}`).join("\n")}

[Approve Focus]() | [Assign Owners]()
`;

  // Generate HTML version
  const contentHtml = `
    <!-- Portfolio Snapshot -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0; color: #fbbf24;">Portfolio Snapshot</h2>
        <span style="font-size: 12px; color: #94a3b8;">Week ${weekNumber}, ${now.getFullYear()}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #fbbf24; margin: 0;">${totalIdeas}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Total Ideas</p>
        </div>
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #fbbf24; margin: 0;">${primaryFocus.allocation}%</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Focus Allocation</p>
        </div>
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #fbbf24; margin: 0;">${actionPlan.filter((a) => a.priority === "High").length}</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">High Priority</p>
        </div>
      </div>
    </div>

    <!-- Primary Focus -->
    <div style="background: #F5A623; color: white; padding: 16px; border-radius: 12px 12px 0 0; text-align: center; font-weight: 800;">
      This Week's Focus
    </div>
    <div style="background: #fef3c7; padding: 16px; border-radius: 0 0 12px 12px; margin-bottom: 24px;">
      <h2 style="font-size: 20px; font-weight: 800; color: #a16207; margin: 0 0 8px 0;">
        ${primaryFocus.ideaTitle}
      </h2>
      <p style="font-size: 14px; color: #a16207; margin: 0; font-weight: 600;">${primaryFocus.allocation}% time allocation</p>
    </div>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Executive Summary</h3>
    <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
      ${advisory.executiveSummary}
    </p>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Market Pulse</h3>
    <ul style="margin: 0 0 24px 0; padding: 0 0 0 20px;">
      ${marketPulse
        .map(
          (item) => `
        <li style="margin-bottom: 8px; font-size: 14px; color: #334155;">${item.newsItem}</li>
      `,
        )
        .join("")}
    </ul>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Strategic Roadmap</h3>
    ${advisory.verdicts
      .map((verdict) => {
        return `
      <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${verdict.ideaTitle}</h4>
        <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;"><strong>Priority:</strong> ${verdict.onePriority}</p>
        <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;"><strong>Status:</strong> ${verdict.status || "validation"}</p>
        <p style="font-size: 13px; color: #475569; margin: 0;"><strong>Allocation:</strong> ${verdict.timeAllocation || 20}%</p>
      </div>
    `;
      })
      .join("")}

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Weekly Action Plan</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
      <thead>
        <tr style="background: #f8fafc; border-radius: 8px 8px 0 0;">
          <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 800; text-transform: uppercase; font-size: 10px;">Action</th>
          <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 800; text-transform: uppercase; font-size: 10px;">Owner</th>
          <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 800; text-transform: uppercase; font-size: 10px;">Due</th>
          <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 800; text-transform: uppercase; font-size: 10px;">Priority</th>
        </tr>
      </thead>
      <tbody>
        ${actionPlan
          .map((action) => {
            const priorityColor =
              action.priority === "High"
                ? "#dc2626"
                : action.priority === "Medium"
                  ? "#f59e0b"
                  : "#10b981";
            return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px; color: #334155;">
              <strong>${action.title}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                <strong>Success:</strong> ${action.success_criteria}<br>
                <strong>Kill:</strong> ${action.kill_criteria}
              </div>
            </td>
            <td style="padding: 12px; color: #334155;">${action.owner}</td>
            <td style="padding: 12px; color: #334155;">${action.due_date}</td>
            <td style="padding: 12px; color: ${priorityColor};">
              <span style="display: inline-block; padding: 2px 8px; background: ${priorityColor}20; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">${action.priority}</span>
            </td>
          </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>

    <!-- VC Corner Section with Dark Background -->
    <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin-bottom: 24px; color: #f8fafc;">
      <!-- VC Corner Header -->
      <h3 style="font-size: 14px; font-weight: 800; color: #fbbf24; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        VC Corner
      </h3>
      
      <!-- Market Sentiment -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 11px; font-weight: 700; color: #94a3b8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Market Sentiment
        </h4>
        <p style="font-size: 14px; color: #f8fafc; margin: 0; line-height: 1.6; font-weight: 600;">
          ${vcCorner.sentiment}
        </p>
      </div>
      
      <!-- The Hard Truth -->
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #334155;">
        <h4 style="font-size: 11px; font-weight: 700; color: #94a3b8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          The Hard Truth
        </h4>
        <p style="font-size: 14px; color: #cbd5e1; margin: 0; line-height: 1.6; font-style: italic;">
          "${vcCorner.brutalHonesty}"
        </p>
      </div>
      
      <!-- Investment Potential -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
          Investment Potential
        </span>
        <span style="font-size: 14px; font-weight: 800; color: ${vcCorner.investmentPotential === "high" ? "#34d399" : vcCorner.investmentPotential === "medium" ? "#fbbf24" : "#f87171"}; text-transform: uppercase;">
          ${vcCorner.investmentPotential}
        </span>
      </div>
    </div>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Why This Might Fail</h3>
    <ul style="margin: 0 0 24px 0; padding: 0 0 0 20px;">
      ${riskCliffs
        .map(
          (risk) => `
        <li style="margin-bottom: 8px; font-size: 14px; color: #334155;"><strong>${risk.ideaTitle}:</strong> ${risk.failureReason}</li>
      `,
        )
        .join("")}
    </ul>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2); margin-right: 12px;">
        Approve Focus
      </a>
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);">
        Assign Owners
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: "The Catalyst Brief",
    contentHtml,
    badge: "Strategic Intelligence",
  });

  // Generate Slack/Telegram summary
  const slackSummary = `🎯 Weekly Focus: ${primaryFocus.ideaTitle} (${primaryFocus.allocation}%) — Key actions: ${actionPlan
    .slice(0, 2)
    .map((a) => a.title)
    .join(", ")}. VC angle: ${vcCorner.investorAngle}`;

  // Generate JSON output
  const jsonOutput = {
    metadata: {
      subject: subjectVariants[0],
      preheader: preheaderVariants[0],
      publish_date: "2026-01-26",
      primary_focus: primaryFocus.ideaTitle,
      focus_allocation: primaryFocus.allocation,
    },
    sections: [
      { type: "executive_summary", content: advisory.executiveSummary },
      { type: "market_pulse", content: marketPulse },
      { type: "strategic_roadmap", content: advisory.verdicts },
      { type: "weekly_action_plan", content: actionPlan },
      { type: "vc_corner", content: vcCorner },
      { type: "risk_cliffs", content: riskCliffs },
    ],
    weekly_action_plan: actionPlan,
    email_variants: {
      markdown: markdownContent,
      html: contentHtml,
    },
    slack_summary: slackSummary,
    subject_variants: subjectVariants,
    preheader_variants: preheaderVariants,
    qa_checklist: [
      "Every action has a success_criteria and an owner assigned",
      "Primary focus set and allocation >= 50%",
      "At least one kill_criteria present",
      "All required fields present in JSON output",
      "Email renders correctly in HTML and Markdown",
    ],
  };

  return sendEmail({
    to,
    subject: subjectVariants[0],
    html,
    text: markdownContent,
  });
}

// ===========================================
// Research Complete Email
// ===========================================

export async function sendResearchCompleteEmail(options: {
  to: string;
  userName: string;
  ideaTitle: string;
  ideaId: string;
  overallScore: number;
  verdict: string;
}): Promise<boolean> {
  const { to, userName, ideaTitle, ideaId, overallScore, verdict } = options;

  const verdictColors: Record<string, { bg: string; text: string }> = {
    "pursue-immediately": { bg: "#dcfce7", text: "#166534" },
    "pursue-with-modifications": { bg: "#dbeafe", text: "#1e40af" },
    "needs-more-research": { bg: "#fef3c7", text: "#a16207" },
    "pivot-needed": { bg: "#fed7aa", text: "#c2410c" },
    "not-recommended": { bg: "#fee2e2", text: "#dc2626" },
  };

  const verdictStyle =
    verdictColors[verdict] || verdictColors["needs-more-research"];

  const contentHtml = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
      Research Complete! 🎉
    </h2>

    <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
      Hi ${userName}, the AI research for your idea is ready.
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
        ${ideaTitle}
      </h3>

      <div style="display: flex; gap: 16px; align-items: center; margin-top: 16px;">
        <div style="text-align: center; background: #ffffff; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 80px;">
          <p style="font-size: 28px; font-weight: 800; color: ${
            overallScore >= 70
              ? "#166534"
              : overallScore >= 50
                ? "#a16207"
                : "#dc2626"
          }; margin: 0;">
            ${overallScore}
          </p>
          <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Score</p>
        </div>
        <div style="flex: 1;">
          <span style="display: inline-block; background: ${
            verdictStyle.bg
          }; color: ${
            verdictStyle.text
          }; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; border: 1px solid ${
            verdictStyle.text
          }20;">
            ${verdict.replace(/-/g, " ")}
          </span>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/ideas/${ideaId}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Full Research
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Research Complete",
    contentHtml,
    badge: "Analysis Ready",
  });

  return sendEmail({
    to,
    subject: `Research Complete: ${ideaTitle} (Score: ${overallScore})`,
    html,
    text: `Hi ${userName}, the AI research for "${ideaTitle}" is ready. Overall score: ${overallScore}. Verdict: ${verdict}. View at ${APP_URL}/ideas/${ideaId}`,
  });
}

// ===========================================
// Verification Email
// ===========================================

export async function sendVerificationEmail(options: {
  to: string;
  userName: string;
  code: string;
  url: string;
}): Promise<boolean> {
  const { to, userName, code, url } = options;

  const contentHtml = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px; text-align: center;">
      Verify your email address
    </h2>

    <p style="font-size: 16px; color: #475569; margin-bottom: 24px; text-align: center;">
      Hi ${userName}, please use the code below to verify your email address and complete your registration.
    </p>

    <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0;">
      <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #F5A623; margin-bottom: 8px;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: 700;">
        Verification Code
      </p>
    </div>

    <div style="text-align: center;">
      <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">
        Or click the button below to verify directly:
      </p>
      <a href="${url}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        Verify Email
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Verify Your Account",
    contentHtml,
    badge: "Security",
  });

  return sendEmail({
    to,
    subject: "Verify your IdeasVault account",
    html,
    text: `Hi ${userName}, your verification code is: ${code}. Or verify here: ${url}`,
  });
}

// ===========================================
// Password Reset Email
// ===========================================

export async function sendPasswordResetEmail(options: {
  to: string;
  userName: string;
  url: string;
}): Promise<boolean> {
  const { to, userName, url } = options;

  const contentHtml = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px; text-align: center;">
      Reset your password
    </h2>

    <p style="font-size: 16px; color: #475569; margin-bottom: 24px; text-align: center;">
      Hi ${userName}, we received a request to reset your password. Click the button below to choose a new one.
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${url}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        Reset Password
      </a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
      This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
  `;

  const html = renderPremiumEmail({
    title: "Reset Your Password",
    contentHtml,
    badge: "Security",
  });

  return sendEmail({
    to,
    subject: "Reset your IdeasVault password",
    html,
    text: `Hi ${userName}, reset your password here: ${url}`,
  });
}

// ===========================================
// Magic Link Email
// ===========================================

export async function sendMagicLinkEmail(options: {
  to: string;
  url: string;
}): Promise<boolean> {
  const { to, url } = options;

  const contentHtml = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px; text-align: center;">
      Sign in to your account
    </h2>

    <p style="font-size: 16px; color: #475569; margin-bottom: 24px; text-align: center;">
      Click the button below to sign in to your IdeasVault account. This link will expire in 10 minutes.
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${url}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        Sign In to IdeasVault
      </a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
      If you didn't request this link, you can safely ignore this email.
    </p>
  `;

  const html = renderPremiumEmail({
    title: "Sign In to IdeasVault",
    contentHtml,
    badge: "Security",
  });

  return sendEmail({
    to,
    subject: "Sign in to IdeasVault",
    html,
    text: `Sign in to IdeasVault here: ${url}`,
  });
}

export async function sendWeeklyUpdateReminderEmail(options: {
  to: string;
  userName: string;
  startupName: string;
  startupSlug: string;
  weekNumber: number;
  reminderDay: "friday" | "saturday";
}): Promise<boolean> {
  const { to, userName, startupName, startupSlug, weekNumber, reminderDay } =
    options;

  const isFriday = reminderDay === "friday";
  const urgencyText = isFriday
    ? "Take a moment this weekend to log your progress."
    : "Last chance to submit your update before the week ends.";

  const contentHtml = `
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
      Time for your weekly update
    </h2>

    <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
      Hi ${userName}, you haven't submitted your weekly update for <strong>${startupName}</strong> yet.
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0; text-align: center;">
      <p style="font-size: 14px; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; font-weight: 700;">Week ${weekNumber}</p>
      <p style="font-size: 32px; font-weight: 800; color: #0f172a; margin: 0;">${startupName}</p>
    </div>

    <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
      ${urgencyText} Consistent tracking helps you spot patterns and stay accountable to your goals.
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        Submit Weekly Update
      </a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
      You're receiving this because you have an active startup on IdeasVault.
    </p>
  `;

  const html = renderPremiumEmail({
    title: "Weekly Update Reminder",
    contentHtml,
    badge: isFriday ? "Reminder" : "Final Reminder",
  });

  const subject = isFriday
    ? `Weekly update due for ${startupName} — Week ${weekNumber}`
    : `Last chance: Submit your weekly update for ${startupName}`;

  return sendEmail({
    to,
    subject,
    html,
    text: `Hi ${userName}, please submit your weekly update for ${startupName} (Week ${weekNumber}). ${urgencyText} Visit ${APP_URL}/startups/${startupSlug}`,
  });
}
