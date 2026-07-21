import type { StrategicAdvisory } from "../agents/types";
import { getEmailBranding, sendEmail } from "./client";

export { getEmailBranding } from "./client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BRAND = getEmailBranding();

function applyEmailTheme(html: string): string {
  const branding = getEmailBranding();

  return html
    .replace(/#ea580c/gi, branding.primaryColor)
    .replace(/#f8fafc/gi, branding.backgroundColor)
    .replace(/#0f172a/gi, branding.secondaryColor)
    .replace(/#e2e8f0/gi, branding.borderColor)
    .replace(/rgba\(245, 166, 35, 0\.2\)/gi, "rgba(234, 88, 12, 0.2)")
    .replace(/rgba\(15, 23, 42, 0\.2\)/gi, "rgba(15, 23, 42, 0.2)");
}

export function resolveVerificationCodeDisplay(
  code?: string,
  fallback?: string,
): string {
  const normalizedCode = code?.trim();
  if (normalizedCode && normalizedCode.length >= 4) {
    return normalizedCode;
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  return "Use the verify button below";
}

export function buildEmailSectionHeading(
  text: string,
  options: { align?: string; color?: string; marginBottom?: string } = {},
): string {
  const { align = "left", color = "#0f172a", marginBottom = "20px" } = options;

  return `<h2 style="font-size: 22px; font-weight: 800; color: ${color}; margin: 0 0 ${marginBottom} 0; text-align: ${align};">${text}</h2>`;
}

export function buildEmailCard(options: {
  children: string;
  background?: string;
  borderColor?: string;
  padding?: string;
  marginBottom?: string;
  textColor?: string;
  align?: string;
  radius?: string;
}): string {
  const {
    children,
    background = "#f8fafc",
    borderColor = "#e2e8f0",
    padding = "24px",
    marginBottom = "24px",
    textColor = "#475569",
    align = "left",
    radius = "16px",
  } = options;

  return `<div style="background: ${background}; border: 1px solid ${borderColor}; border-radius: ${radius}; padding: ${padding}; margin-bottom: ${marginBottom}; text-align: ${align}; color: ${textColor};">${children}</div>`;
}

export function buildEmailButton(options: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}): string {
  const branding = getEmailBranding();
  const { href, label, variant = "primary" } = options;
  const background =
    variant === "secondary" ? branding.secondaryColor : branding.primaryColor;
  const textColor = branding.buttonTextColor || "#ffffff";

  return `<a href="${href}" style="display: inline-block; background: ${background}; color: ${textColor}; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 20px -8px rgba(15, 23, 42, 0.24);">${label}</a>`;
}

export function buildEmailList(items: string[]): string {
  const listItems = items
    .map((item) => `<li style="margin-bottom: 8px;">${item}</li>`)
    .join("");

  return `<ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7;">${listItems}</ul>`;
}

// ===========================================
// Shared Premium Layout
// ===========================================

export function renderPremiumEmail(options: {
  title: string;
  previewTextText?: string;
  contentHtml: string;
  footerHtml?: string;
  badge?: string;
}) {
  const { title, previewTextText, contentHtml, footerHtml, badge } = options;
  const branding = getEmailBranding();
  const currentYear = new Date().getFullYear();
  const footerContent =
    footerHtml ||
    `<a href="${APP_URL}/settings" style="color: ${branding.subtleTextColor}; text-decoration: underline;">Manage Preferences</a>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light;
      supported-color-schemes: light;
    }
    
    /* Force light mode background & text color in email clients */
    body, .email-body-wrapper {
      background-color: #f8fafc !important;
      color: #334155 !important;
    }
    .email-shell {
      background-color: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
    }
    
    /* Force light mode in Gmail */
    u + .body {
      background-color: #f8fafc !important;
      color: #334155 !important;
    }
    u + .body .email-shell {
      background-color: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
    }
    
    /* Force light mode in Outlook */
    [data-ogsc] body, [data-ogsc] .email-body-wrapper {
      background-color: #f8fafc !important;
      color: #334155 !important;
    }
    [data-ogsc] .email-shell {
      background-color: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
    }
    [data-ogsb] body, [data-ogsb] .email-body-wrapper {
      background-color: #f8fafc !important;
      color: #334155 !important;
    }
    [data-ogsb] .email-shell {
      background-color: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
    }

    @media only screen and (max-width: 620px) {
      body { padding: 12px !important; }
      .email-shell { width: 100% !important; }
      .email-header { padding: 24px 20px !important; }
      .email-body { padding: 24px 20px !important; }
      .email-title { font-size: 22px !important; }
      .email-footer { padding: 0 20px 24px !important; }
    }
  </style>
</head>
<body class="body" style="margin: 0; padding: 24px; background-color: ${branding.backgroundColor}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; word-break: break-word;">
  ${
    previewTextText
      ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; visibility: hidden;">${previewTextText}</div>`
      : ""
  }
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; max-width: 640px; margin: 0 auto;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-shell" style="border-collapse: collapse; width: 100%; max-width: 640px; background-color: #ffffff; border: 1px solid ${branding.borderColor}; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td class="email-header" style="padding: 32px 24px 20px 24px; text-align: center; border-bottom: 1px solid ${branding.borderColor};">
              <a href="${APP_URL}" style="display: inline-flex; align-items: center; text-decoration: none;" target="_blank">
                <img src="https://res.cloudinary.com/duzg7l0eo/image/upload/v1783924293/icon_lbltlb.png" alt="${branding.appName} Logo" style="object-fit: contain; height: 52px; width: 52px; margin-right: 12px; vertical-align: middle;" />
                <span style="font-size: 26px; line-height: 52px; font-weight: 800; color: ${branding.secondaryColor}; font-family: 'Inter', sans-serif; vertical-align: middle; letter-spacing: -0.02em;">${branding.appName}</span>
              </a>
            </td>
          </tr>
          <tr>
            <td class="email-header" style="padding: 32px 24px 16px 24px; background-color: #ffffff; text-align: center;">
              ${
                badge
                  ? `
              <div style="display: inline-block; padding: 4px 12px; background: ${branding.accentColor}; border: 1px solid #ffedd5; border-radius: 9999px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 700; color: ${branding.primaryColor}; text-transform: uppercase; letter-spacing: 0.05em;">${badge}</span>
              </div>`
                  : ""
              }
              <h1 class="email-title" style="font-size: 26px; font-weight: 800; margin: 0; color: ${branding.secondaryColor}; line-height: 1.3; letter-spacing: -0.01em;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td class="email-body" style="padding: 16px 24px 32px 24px;">
              ${contentHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="email-footer" style="padding: 16px 12px 0; text-align: center;">
        <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #94a3b8;">
          © ${currentYear} ${branding.appName}. ${footerContent}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return applyEmailTheme(html);
}

// ===========================================
// Welcome Email
// ===========================================

export async function sendWelcomeEmail(options: {
  to: string;
  userName: string;
}): Promise<boolean> {
  const { to, userName } = options;
  const branding = getEmailBranding();

  const contentHtml = `
    ${buildEmailSectionHeading(`Welcome, ${userName}!`, { color: branding.secondaryColor, marginBottom: "16px" })}

    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0; line-height: 1.7;">
      You just joined the AI co-founder workspace built for serious founders. Turn raw ideas into validated opportunities with clear market signals, execution guidance, and investor-ready insights.
    </p>

    ${buildEmailCard({
      children: `
        <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Launch faster with Genesyz:</h3>
        ${buildEmailList([
          "Validate ideas with a multi-agent AI research pipeline",
          "Track weekly startup progress, goals, and momentum in one dashboard",
          "Discover grants, fellowships, competitions, and accelerator opportunities",
          "Export polished research reports to share with teammates and stakeholders",
        ])}
      `,
      marginBottom: "24px",
    })}

    ${buildEmailCard({
      children: `<p style="font-size: 14px; margin: 0; color: #7c2d12; line-height: 1.7;"><strong style="color: #ea580c;">Pro tip:</strong> founders who validate their first idea in the first 24 hours build sharper products and waste less time. Start now and compound your edge.</p>`,
      background: "#fff7ed",
      borderColor: "#ffedd5",
      textColor: "#7c2d12",
      padding: "18px 20px",
      marginBottom: "24px",
    })}

    <div style="text-align: center;">
      ${buildEmailButton({
        href: `${APP_URL}/dashboard`,
        label: "Validate Your First Idea",
      })}
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Welcome to Genesyz",
    contentHtml,
    badge: "Welcome",
  });

  return sendEmail({
    to,
    subject: "Welcome to Genesyz - let’s validate your first startup idea",
    html,
    text: `Welcome to Genesyz, ${userName}! You're now in the AI co-founder workspace for validating and executing startup ideas. Validate your first idea now: ${APP_URL}/dashboard`,
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
    ${buildEmailSectionHeading(`Hi ${userName}, here's your weekly update`, { color: "#0f172a", marginBottom: "24px" })}

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
      ${buildEmailCard({
        children: `<p style="font-size: 32px; font-weight: 800; color: #ea580c; margin: 0;">${totalIdeas}</p><p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0; text-transform: uppercase; font-weight: 700;">Active Ideas</p>`,
        background: "#f8fafc",
        padding: "20px",
        marginBottom: "0",
        align: "center",
        radius: "12px",
      })}
      ${buildEmailCard({
        children: `<p style="font-size: 32px; font-weight: 800; color: #ea580c; margin: 0;">${averageScore}</p><p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0; text-transform: uppercase; font-weight: 700;">Avg Score</p>`,
        background: "#f8fafc",
        padding: "20px",
        marginBottom: "0",
        align: "center",
        radius: "12px",
      })}
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
          No ideas yet. <a href="${APP_URL}/ideas/new" style="color: #ea580c; font-weight: 700;">Capture your first idea</a>
        </p>
      </div>
    `
    }

    <div style="text-align: center; margin-top: 32px;">
      ${buildEmailButton({ href: `${APP_URL}/dashboard`, label: "View Dashboard" })}
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Weekly Digest",
    contentHtml,
    badge: "Weekly Update",
  });

  return sendEmail({
    to,
    subject: `Your Weekly Genesyz Digest - ${totalIdeas} ideas, avg score ${averageScore}`,
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

  // Handle both old schema (nested objects) and new schema (flat/simple)
  const advisoryAny = advisory as any;

  const primaryFocus = advisoryAny.primaryFocus || {
    ideaTitle: "Your Top Idea",
    allocation: 60,
  };

  // marketPulse: old = objects, new = strings
  const marketPulseRaw = advisoryAny.marketPulse || [];
  const marketPulse = Array.isArray(marketPulseRaw)
    ? marketPulseRaw
        .slice(0, 3)
        .map((item: any) =>
          typeof item === "string" ? item : item?.newsItem || "",
        )
        .filter(Boolean)
    : [];

  const vcCorner = advisoryAny.vcCorner || {};
  const riskCliffs = advisoryAny.riskCliffs || [];
  const actionPlan = advisoryAny.weeklyActionPlan || [];

  // verdicts: old = objects, new = strings
  const verdictsRaw = advisoryAny.verdicts || [];
  const totalIdeas = Array.isArray(verdictsRaw) ? verdictsRaw.length : 0;
  const topIdeas = Array.isArray(verdictsRaw) ? verdictsRaw.slice(0, 3) : [];

  // New schema fields (may not exist in old format)
  const vcSentiment = advisoryAny.vcSentiment || vcCorner.sentiment || "";
  const topRisks = advisoryAny.topRisks || [];
  const failureReasons = advisoryAny.failureReasons || [];
  const weeklyFocus = advisoryAny.weeklyFocus || "";
  const investmentPotential = advisoryAny.investmentPotential || "medium";

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
    `VC Corner: ${vcSentiment || "Strategic insights inside"}`,
    `Action required: ${actionPlan.filter((a: any) => a.priority === "High").length} high-priority tasks`,
  ];

  // Format data for HTML template - handle both old and new formats
  const formatHtmlMarketPulse = () => {
    if (!marketPulse.length)
      return '<li style="margin-bottom: 8px; font-size: 14px; color: #334155;">No market updates</li>';
    return marketPulse
      .map(
        (item: string) =>
          `<li style="margin-bottom: 8px; font-size: 14px; color: #334155;">${item}</li>`,
      )
      .join("");
  };

  const formatHtmlVerdicts = () => {
    if (!topIdeas.length)
      return '<p style="font-size: 13px; color: #475569;">No verdicts available</p>';
    return topIdeas
      .map((verdict: any) => {
        const title =
          typeof verdict === "string" ? verdict : verdict.ideaTitle || "Idea";
        const priority =
          typeof verdict === "string" ? "" : verdict.onePriority || "";
        const status =
          typeof verdict === "string"
            ? "validation"
            : verdict.status || "validation";
        const allocation =
          typeof verdict === "string"
            ? "20%"
            : (verdict.timeAllocation || 20) + "%";
        return `
      <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${title}</h4>
        ${priority ? `<p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;"><strong>Priority:</strong> ${priority}</p>` : ""}
        <p style="font-size: 13px; color: #475569; margin: 0 0 4px 0;"><strong>Status:</strong> ${status}</p>
        <p style="font-size: 13px; color: #475569; margin: 0;"><strong>Allocation:</strong> ${allocation}</p>
      </div>`;
      })
      .join("");
  };

  const formatHtmlActionPlan = () => {
    if (!actionPlan.length) {
      return `<tr><td colspan="4" style="padding: 12px; color: #475569;">${weeklyFocus || "Focus on your primary goal this week"}</td></tr>`;
    }
    return actionPlan
      .map((action: any) => {
        const priority = action.priority || "Medium";
        const priorityColor =
          priority === "High"
            ? "#dc2626"
            : priority === "Medium"
              ? "#f59e0b"
              : "#10b981";
        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px; color: #334155;">
              <strong>${action.title || "Action"}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                <strong>Success:</strong> ${action.success_criteria || "Complete the task"}<br>
                <strong>Kill:</strong> ${action.kill_criteria || "N/A"}
              </div>
            </td>
            <td style="padding: 12px; color: #334155;">${action.owner || "You"}</td>
            <td style="padding: 12px; color: #334155;">${action.due_date || "This week"}</td>
            <td style="padding: 12px; color: ${priorityColor};">
              <span style="display: inline-block; padding: 2px 8px; background: ${priorityColor}20; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">${priority}</span>
            </td>
          </tr>`;
      })
      .join("");
  };

  const formatHtmlRisks = () => {
    if (riskCliffs.length) {
      return riskCliffs
        .map((risk: any) => {
          const title = typeof risk === "string" ? "" : risk.ideaTitle || "";
          const reason =
            typeof risk === "string"
              ? risk
              : risk.failureReason || "Monitor closely";
          return title ? `<strong>${title}:</strong> ${reason}` : reason;
        })
        .join("<br>");
    }
    if (topRisks.length) {
      return topRisks.map((r: string) => r).join("<br>");
    }
    return "No specific risks identified";
  };

  // Get high priority count
  const highPriorityCount = actionPlan.filter(
    (a: any) => a.priority === "High",
  ).length;

  // Format data for Markdown template
  const formatVerdicts = () => {
    if (!topIdeas.length) return "No verdicts available";
    return topIdeas
      .map((verdict: any) => {
        if (typeof verdict === "string") return `- ${verdict}`;
        return `#### ${verdict.ideaTitle || "Idea"}\n- ${verdict.onePriority || "Continue monitoring"}\n- Status: ${verdict.status || "validation"}\n- Allocation: ${verdict.timeAllocation || 20}%`;
      })
      .join("\n");
  };

  const formatActionPlan = () => {
    if (actionPlan.length) {
      return actionPlan
        .map((action: any) => {
          return `- **${action.title || "Action"}** (${action.priority || "Medium"})\n  - Owner: ${action.owner || "You"}\n  - Due: ${action.due_date || "This week"}\n  - Time: ${action.estimated_time_allocation || "As needed"}\n  - Success: ${action.success_criteria || "Complete the task"}\n  - Kill: ${action.kill_criteria || "N/A"}`;
        })
        .join("\n");
    }
    return weeklyFocus || "Focus on your primary goal this week";
  };

  const formatRiskCliffs = () => {
    if (riskCliffs.length) {
      return riskCliffs
        .map((risk: any) => {
          if (typeof risk === "string") return `- ${risk}`;
          return `- **${risk.ideaTitle || "Idea"}:** ${risk.failureReason || "Monitor closely"}`;
        })
        .join("\n");
    }
    if (topRisks.length) {
      return topRisks.map((r: string) => `- ${r}`).join("\n");
    }
    return "No specific risks identified";
  };

  // Generate Markdown version
  const markdownContent = `
# Founder Focus This Week

## ${primaryFocus.ideaTitle} - ${primaryFocus.allocation}% time allocation

### Executive Summary
${advisoryAny.executiveSummary || "No summary available"}

### Market Pulse
${marketPulse.length ? marketPulse.map((item: string) => `- ${item}`).join("\n") : "No market updates"}

### Strategic Roadmap
${formatVerdicts()}

### Weekly Action Plan
${formatActionPlan()}

### VC Corner
${vcSentiment || "No VC updates available"}

### Why This Might Fail
${formatRiskCliffs()}

[Approve Focus]() | [Assign Owners]()
`;

  // Generate HTML version
  const contentHtml = `
    <!-- Portfolio Snapshot -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-direction: row;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0; color: #0f172a;">Portfolio Snapshot</h2>
        <span style="font-size: 12px; color: #64748b;">Week ${weekNumber}, ${now.getFullYear()}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #ea580c; margin: 0;">${totalIdeas}</p>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Total Ideas</p>
        </div>
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #ea580c; margin: 0;">${primaryFocus.allocation}%</p>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">Focus Allocation</p>
        </div>
        <div>
          <p style="font-size: 28px; font-weight: 800; color: #ea580c; margin: 0;">${actionPlan.filter((a: any) => a.priority === "High").length}</p>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 700;">High Priority</p>
        </div>
      </div>
    </div>

    <!-- Primary Focus -->
    <div style="background: #ea580c; color: white; padding: 16px; border-radius: 12px 12px 0 0; text-align: center; font-weight: 800;">
      This Week's Focus
    </div>
    <div style="background: #fff7ed; border: 1px solid #ffedd5; border-top: none; padding: 20px; border-radius: 0 0 12px 12px; margin-bottom: 24px;">
      <h2 style="font-size: 20px; font-weight: 800; color: #7c2d12; margin: 0 0 8px 0;">
        ${primaryFocus.ideaTitle}
      </h2>
      <p style="font-size: 14px; color: #ea580c; margin: 0; font-weight: 700;">${primaryFocus.allocation}% time allocation</p>
    </div>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Executive Summary</h3>
    <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
      ${advisoryAny.executiveSummary || "No summary available"}
    </p>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Market Pulse</h3>
    <ul style="margin: 0 0 24px 0; padding: 0 0 0 20px;">
      ${formatHtmlMarketPulse()}
    </ul>

    <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Strategic Roadmap</h3>
    ${formatHtmlVerdicts()}

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
        ${formatHtmlActionPlan()}
      </tbody>
    </table>

    <!-- VC Corner Section in Light Mode -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; color: #334155;">
      <!-- VC Corner Header -->
      <h3 style="font-size: 14px; font-weight: 800; color: #ea580c; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        VC Corner
      </h3>

      <!-- Market Sentiment -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 11px; font-weight: 700; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Market Sentiment
        </h4>
        <p style="font-size: 14px; color: #0f172a; margin: 0; line-height: 1.6; font-weight: 600;">
          ${vcSentiment || vcCorner.sentiment || "No VC updates available"}
        </p>
      </div>

      <!-- Investment Potential -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 11px; font-weight: 700; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Investment Potential
        </h4>
        <p style="font-size: 14px; color: ${vcCorner.investmentPotential === "high" ? "#16a34a" : vcCorner.investmentPotential === "medium" ? "#d97706" : "#dc2626"}; margin: 0; line-height: 1.6; font-weight: 800; text-transform: uppercase;">
          ${vcCorner.investmentPotential || investmentPotential}
        </p>
      </div>

      <!-- Why This Might Fail -->
      <div style="margin-bottom: 0;">
        <h4 style="font-size: 11px; font-weight: 700; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Why This Might Fail
        </h4>
        <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.6;">
          ${formatHtmlRisks()}
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2); margin-right: 12px;">
        Approve Focus
      </a>
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #334155; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(51, 65, 85, 0.2);">
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
  const actionTitles = actionPlan
    .slice(0, 2)
    .map((a: any) => a.title || "Action")
    .join(", ");
  const slackSummary = `🎯 Weekly Focus: ${primaryFocus.ideaTitle} (${primaryFocus.allocation}%) - Key actions: ${actionTitles}. VC angle: ${vcSentiment || vcCorner.investorAngle || "N/A"}`;

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
      <a href="${APP_URL}/ideas/${ideaId}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
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
  code?: string;
  url: string;
}): Promise<boolean> {
  const { to, userName, code, url } = options;
  const branding = getEmailBranding();
  const displayCode = resolveVerificationCodeDisplay(code, url);

  const contentHtml = `
    ${buildEmailSectionHeading("Verify your email address", { color: branding.secondaryColor, align: "center", marginBottom: "16px" })}

    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0; text-align: center; line-height: 1.7;">
      Hi ${userName}, please use the code below to verify your email address and complete your registration.
    </p>

    ${buildEmailCard({
      children: `
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: ${branding.primaryColor}; margin-bottom: 8px;">${displayCode}</div>
        <p style="font-size: 12px; color: #94a3b8; margin: 0; text-transform: uppercase; font-weight: 700;">Verification Code</p>
      `,
      background: branding.backgroundColor,
      borderColor: branding.borderColor,
      padding: "32px",
      marginBottom: "24px",
      align: "center",
      radius: "16px",
    })}

    <div style="text-align: center;">
      <p style="font-size: 14px; color: #64748b; margin: 0 0 16px 0;">
        Or click the button below to verify directly:
      </p>
      ${buildEmailButton({ href: url, label: "Verify Email" })}
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Verify Your Account",
    contentHtml,
    badge: "Security",
  });

  return sendEmail({
    to,
    subject: "Verify your Genesyz account",
    html,
    text: `Hi ${userName}, your verification code is: ${displayCode}. Or verify here: ${url}`,
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
  const branding = getEmailBranding();

  const contentHtml = `
    ${buildEmailSectionHeading("Reset your password", { color: branding.secondaryColor, align: "center", marginBottom: "16px" })}

    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0; text-align: center; line-height: 1.7;">
      Hi ${userName}, we received a request to reset your password. Click the button below to choose a new one.
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
      ${buildEmailButton({ href: url, label: "Reset Password" })}
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.6;">
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
    subject: "Reset your Genesyz password",
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
  const branding = getEmailBranding();

  const contentHtml = `
    ${buildEmailSectionHeading("Sign in to your account", { color: branding.secondaryColor, align: "center", marginBottom: "16px" })}

    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0; text-align: center; line-height: 1.7;">
      Click the button below to sign in to your Genesyz account. This link will expire in 10 minutes.
    </p>

    <div style="text-align: center; margin-bottom: 24px;">
      ${buildEmailButton({ href: url, label: "Sign In to Genesyz" })}
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.6;">
      If you didn't request this link, you can safely ignore this email.
    </p>
  `;

  const html = renderPremiumEmail({
    title: "Sign In to Genesyz",
    contentHtml,
    badge: "Security",
  });

  return sendEmail({
    to,
    subject: "Sign in to Genesyz",
    html,
    text: `Sign in to Genesyz here: ${url}`,
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
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        Submit Weekly Update
      </a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
      You're receiving this because you have an active startup on Genesyz.
    </p>
  `;

  const html = renderPremiumEmail({
    title: "Weekly Update Reminder",
    contentHtml,
    badge: isFriday ? "Reminder" : "Final Reminder",
  });

  const subject = isFriday
    ? `Weekly update due for ${startupName} - Week ${weekNumber}`
    : `Last chance: Submit your weekly update for ${startupName}`;

  return sendEmail({
    to,
    subject,
    html,
    text: `Hi ${userName}, please submit your weekly update for ${startupName} (Week ${weekNumber}). ${urgencyText} Visit ${APP_URL}/startups/${startupSlug}`,
  });
}

export async function sendStartupFeatureAnnouncementEmail(options: {
  to: string;
  userName: string;
}): Promise<boolean> {
  const { to, userName } = options;

  const contentHtml = `
    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
      Hi ${userName}, Genesyz is evolving. We started as an idea validation
      tool. Now we're a startup operating system for execution-focused founders.
    </p>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; font-weight: 800; color: #166534; text-align: center;">
        Less guessing. More measurable traction.
      </p>
    </div>

    <h3 style="font-size: 12px; font-weight: 800; color: #64748b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">
      What's New
    </h3>

    <div style="margin-bottom: 20px;">
      <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
        📊 Enhanced Metrics Tracking
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.7;">
        <li><strong>35+ categorized metrics</strong> - Revenue, engagement, marketplace, growth</li>
        <li><strong>Smart formatting</strong> - $1,234 for currency, 15.5% for percentages</li>
        <li><strong>Flexible periods</strong> - Daily, weekly, monthly, quarterly, yearly</li>
        <li><strong>Custom metrics</strong> - Define your own when standards don't fit</li>
      </ul>
    </div>

    <div style="margin-bottom: 24px;">
      <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
        ✅ Weekly Goal Review
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 1.7;">
        <li><strong>Checkbox tracking</strong> - Mark goals complete with one click</li>
        <li><strong>Auto-calculated rates</strong> - See "2/3 completed, 67%"</li>
        <li><strong>AI accountability</strong> - Coach factors in execution consistency</li>
      </ul>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <h4 style="font-size: 12px; font-weight: 800; color: #64748b; margin: 0 0 12px 0; text-transform: uppercase;">
        Platform Capabilities
      </h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Idea Validation</p>
          <ul style="margin: 0; padding-left: 16px; color: #64748b; font-size: 12px; line-height: 1.6;">
            <li>AI-powered research</li>
            <li>Multi-dimensional scoring</li>
            <li>PDF export</li>
          </ul>
        </div>
        <div>
          <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Startup Tracking</p>
          <ul style="margin: 0; padding-left: 16px; color: #64748b; font-size: 12px; line-height: 1.6;">
            <li>Weekly progress updates</li>
            <li>Metrics dashboard</li>
            <li>Blunt AI feedback</li>
          </ul>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 24px;">
      <p style="font-size: 11px; color: #94a3b8; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
        Coming Soon
      </p>
      <p style="font-size: 13px; color: #64748b; margin: 0;">
        Startup School (curated resources) • Co-Founder Match
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/startups" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Your Startups
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: "Platform Update",
    previewTextText:
      "From idea validation to execution tracking - Genesyz is now a complete startup operating system.",
    contentHtml,
    badge: "Update",
  });

  return sendEmail({
    to,
    subject:
      "Track what matters: 35+ new metrics + better execution tools for your startup",
    html,
    text: `Hi ${userName}, Genesyz is evolving. We're now a startup operating system for execution-focused founders. New: 35+ categorized metrics, smart formatting, weekly goal review with completion rates. Less guessing. More measurable traction. View your startups at ${APP_URL}/startups`,
  });
}

interface WeeklyReportMetric {
  type: string;
  value: number;
  period?: string | null;
  customMetricName?: string | null;
}

interface WeeklyReportGoal {
  goalText: string;
  completed: boolean;
}

interface WeeklyReportAnalysis {
  positives?: string[];
  concerns?: string[];
}

interface WeeklyReportTrajectory {
  summary?: string;
}

interface WeeklyReportData {
  weekNumber: number;
  isLaunched: boolean;
  primaryMetricType: string;
  primaryMetricValue: number;
  primaryMetricDelta: number | null;
  metricPeriod?: string | null;
  metricFormat?: "CURRENCY" | "PERCENTAGE" | "NUMBER" | null;
  customMetricName?: string | null;
  additionalMetrics?: WeeklyReportMetric[] | null;
  usersTalkedTo: number;
  moraleScore: number;
  previousGoalsReview?: WeeklyReportGoal[] | null;
  goalsCompletionRate?: number | null;
  aiVerdict: string | null;
  aiAnalysis: WeeklyReportAnalysis;
  aiTrajectory: WeeklyReportTrajectory;
  aiRecommendations: string[];
}

function formatMetricValue(
  value: number,
  format: "CURRENCY" | "PERCENTAGE" | "NUMBER",
): string {
  switch (format) {
    case "CURRENCY":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "PERCENTAGE":
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
}

function formatMetricLabel(
  metricType: string,
  customName?: string | null,
): string {
  if (metricType === "CUSTOM" && customName) {
    return customName;
  }
  return metricType.replace(/_/g, " ").toLowerCase();
}

export async function sendStartupWeeklyReportEmail(options: {
  to: string;
  userName: string;
  startupName: string;
  startupSlug: string;
  report: WeeklyReportData;
}): Promise<boolean> {
  const { to, userName, startupName, startupSlug, report } = options;

  const VERDICT_STYLES: Record<string, { color: string; label: string }> = {
    ON_TRACK: { color: "#16a34a", label: "On Track" },
    NEEDS_ATTENTION: { color: "#ca8a04", label: "Needs Attention" },
    AT_RISK: { color: "#dc2626", label: "At Risk" },
  };

  const verdict = report.aiVerdict ? VERDICT_STYLES[report.aiVerdict] : null;

  const primaryFormat = report.metricFormat || "NUMBER";
  const primaryValueDisplay = formatMetricValue(
    report.primaryMetricValue,
    primaryFormat,
  );

  const metricDelta = report.primaryMetricDelta;
  const metricDeltaDisplay =
    metricDelta !== null
      ? `${metricDelta >= 0 ? "+" : ""}${primaryFormat === "PERCENTAGE" ? `${metricDelta.toFixed(1)}%` : formatMetricValue(Math.abs(metricDelta), primaryFormat)}`
      : "No change";

  const completedGoals =
    report.previousGoalsReview?.filter((g) => g.completed).length || 0;
  const totalGoals = report.previousGoalsReview?.length || 0;
  const goalsPercentage =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const additionalMetricsHtml = report.additionalMetrics?.length
    ? report.additionalMetrics
        .map((metric) => {
          const format = (
            metric.type.includes("PERCENTAGE")
              ? "PERCENTAGE"
              : metric.type.includes("REVENUE") ||
                  metric.type.includes("MRR") ||
                  metric.type.includes("ARR")
                ? "CURRENCY"
                : "NUMBER"
          ) as "CURRENCY" | "PERCENTAGE" | "NUMBER";
          const value = formatMetricValue(metric.value, format);
          const label = formatMetricLabel(metric.type, metric.customMetricName);
          return `
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">${label}</div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a;">${value}</div>
            ${metric.period ? `<div style="font-size: 10px; color: #94a3b8;">${metric.period.toLowerCase()}</div>` : ""}
          </div>
        `;
        })
        .join("")
    : "";

  const verdictHtml = verdict
    ? `
    <div style="background: ${verdict.color}15; border-left: 4px solid ${verdict.color}; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <div style="font-weight: 800; color: ${verdict.color}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">${verdict.label}</div>
    </div>
  `
    : "";

  const goalsHtml =
    totalGoals > 0
      ? `
    <div style="background: ${goalsPercentage >= 67 ? "#dcfce7" : goalsPercentage >= 33 ? "#fef3c7" : "#fee2e2"}; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 14px; font-weight: 700; color: #374151;">Last Week's Goals</span>
          <span style="margin-left: 8px; font-size: 12px; color: #64748b;">${completedGoals}/${totalGoals} completed</span>
        </div>
        <div style="font-size: 24px; font-weight: 800; color: ${goalsPercentage >= 67 ? "#16a34a" : goalsPercentage >= 33 ? "#ca8a04" : "#dc2626"};">${goalsPercentage}%</div>
      </div>
    </div>
  `
      : "";

  const metricsHtml = `
    <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">This Week's Numbers</h3>
    <div style="display: grid; grid-template-columns: repeat(${report.isLaunched ? "3" : "2"}, 1fr); gap: 12px; margin-bottom: 24px;">
      ${
        report.isLaunched
          ? `<div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">${formatMetricLabel(report.primaryMetricType, report.customMetricName)}</div>
          <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${primaryValueDisplay}</div>
          <div style="font-size: 12px; color: ${metricDelta && metricDelta >= 0 ? "#16a34a" : "#dc2626"}; font-weight: 600;">${metricDeltaDisplay}</div>
        </div>`
          : ""
      }
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Users Talked To</div>
        <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${report.usersTalkedTo}</div>
      </div>
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Morale</div>
        <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${report.moraleScore}/10</div>
      </div>
    </div>
  `;

  const additionalMetricsSection = additionalMetricsHtml
    ? `
    <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Additional Metrics</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
      ${additionalMetricsHtml}
    </div>
  `
    : "";

  const positivesHtml = report.aiAnalysis?.positives?.length
    ? `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #16a34a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">What's Working</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
        ${report.aiAnalysis.positives.map((p) => `<li style="margin-bottom: 8px;">${p}</li>`).join("")}
      </ul>
    </div>
  `
    : "";

  const concernsHtml = report.aiAnalysis?.concerns?.length
    ? `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #ca8a04; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Watch Out</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
        ${report.aiAnalysis.concerns.map((c) => `<li style="margin-bottom: 8px;">${c}</li>`).join("")}
      </ul>
    </div>
  `
    : "";

  const trajectoryHtml = report.aiTrajectory?.summary
    ? `
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <h3 style="font-size: 12px; font-weight: 800; color: #92400e; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Is It Going To Work?</h3>
      <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.6;">${report.aiTrajectory.summary}</p>
    </div>
  `
    : "";

  const recommendationsHtml = report.aiRecommendations?.length
    ? `
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Next Week's Focus</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
        ${report.aiRecommendations
          .slice(0, 3)
          .map((r) => `<li style="margin-bottom: 8px;">${r}</li>`)
          .join("")}
      </ul>
    </div>
  `
    : "";

  const contentHtml = `
    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
      Hi ${userName}, here's your weekly progress report for <strong>${startupName}</strong>.
    </p>

    ${verdictHtml}
    ${goalsHtml}
    ${metricsHtml}
    ${additionalMetricsSection}
    ${positivesHtml}
    ${concernsHtml}
    ${trajectoryHtml}
    ${recommendationsHtml}

    <div style="text-align: center;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Full Dashboard
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: startupName,
    contentHtml,
    badge: `Week ${report.weekNumber} Report`,
  });

  const textSummary = `
Hi ${userName}, here's your weekly progress report for ${startupName}.

Week ${report.weekNumber} Summary:
- Primary Metric: ${primaryValueDisplay} (${metricDeltaDisplay})
- Users Talked To: ${report.usersTalkedTo}
- Morale: ${report.moraleScore}/10
${verdict ? `- Status: ${verdict.label}` : ""}
${totalGoals > 0 ? `- Goals: ${completedGoals}/${totalGoals} completed (${goalsPercentage}%)` : ""}

View full details at ${APP_URL}/startups/${startupSlug}
  `.trim();

  return sendEmail({
    to,
    subject: `${startupName} Weekly Report - Week ${report.weekNumber}`,
    html,
    text: textSummary,
  });
}

// ===========================================
// Team Invitation Email
// ===========================================

const ROLE_PERMISSIONS_EMAIL: Record<string, string[]> = {
  ADMIN: [
    "Add and remove team members",
    "Change team member roles",
    "Edit startup profile",
    "Submit weekly updates",
  ],
  MEMBER: [
    "Submit weekly updates",
    "View startup dashboard",
    "View team members",
  ],
  VIEWER: ["View startup dashboard", "View team members"],
};

export async function sendStartupMemberInvitedEmail(options: {
  to: string;
  userName: string;
  inviterName: string;
  startupName: string;
  startupSlug: string;
  role: string;
}): Promise<boolean> {
  const { to, userName, inviterName, startupName, startupSlug, role } = options;

  const permissions = ROLE_PERMISSIONS_EMAIL[role] || [];

  const contentHtml = `
    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
      <strong>${inviterName}</strong> has invited you to join <strong>${startupName}</strong> on Genesyz as a <strong>${role}</strong>.
    </p>

    ${
      permissions.length > 0
        ? `
    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
        Your permissions as ${role}:
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        ${permissions.map((p) => `<li style="margin-bottom: 8px;">${p}</li>`).join("")}
      </ul>
    </div>
    `
        : ""
    }

    <div style="text-align: center;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Startup
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: `You're invited to ${startupName}!`,
    contentHtml,
    badge: "Team Invitation",
  });

  return sendEmail({
    to,
    subject: `You're invited to join ${startupName} on Genesyz`,
    html,
    text: `${inviterName} has invited you to join ${startupName} on Genesyz as a ${role}. View the startup at ${APP_URL}/startups/${startupSlug}`,
  });
}

// ===========================================
// Team Role Changed Email
// ===========================================

export async function sendStartupMemberRoleChangedEmail(options: {
  to: string;
  userName: string;
  startupName: string;
  startupSlug: string;
  oldRole: string;
  newRole: string;
  changedByName: string;
}): Promise<boolean> {
  const {
    to,
    userName,
    startupName,
    startupSlug,
    oldRole,
    newRole,
    changedByName,
  } = options;

  const newPermissions = ROLE_PERMISSIONS_EMAIL[newRole] || [];

  const contentHtml = `
    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
      Your role in <strong>${startupName}</strong> has been changed by <strong>${changedByName}</strong>.
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <p style="margin: 0 0 12px 0; color: #475569;">
        <strong>Old role:</strong> ${oldRole}
      </p>
      <p style="margin: 0 0 16px 0; color: #0f172a;">
        <strong>New role:</strong> ${newRole}
      </p>

      ${
        newPermissions.length > 0
          ? `
        <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
          Your new permissions:
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
          ${newPermissions.map((p) => `<li style="margin-bottom: 8px;">${p}</li>`).join("")}
        </ul>
      `
          : ""
      }
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Startup
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: `Your role in ${startupName} changed`,
    contentHtml,
    badge: "Role Update",
  });

  return sendEmail({
    to,
    subject: `Your role in ${startupName} has been changed to ${newRole}`,
    html,
    text: `Your role in ${startupName} has been changed from ${oldRole} to ${newRole} by ${changedByName}. View the startup at ${APP_URL}/startups/${startupSlug}`,
  });
}

// ===========================================
// New Follower Added Email
// ===========================================

export async function sendNewFollowerAddedEmail(options: {
  to: string;
  followerName?: string | null;
  startupName: string;
  startupSlug: string;
}): Promise<boolean> {
  const { to, followerName, startupName, startupSlug } = options;

  const greetingName = followerName || "there";

  const contentHtml = `
    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
      Hi ${greetingName}, you've been added as a follower to <strong>${startupName}</strong> on Genesyz.
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
        What this means
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">You'll receive weekly progress updates about ${startupName}</li>
        <li style="margin-bottom: 8px;">Stay informed about their journey without needing to ask</li>
        <li style="margin-bottom: 8px;">Get insights into their metrics, goals, and milestones</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Startup
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: `You're now following ${startupName}`,
    contentHtml,
    badge: "New Follower",
  });

  return sendEmail({
    to,
    subject: `You're now following ${startupName} on Genesyz`,
    html,
    text: `Hi ${greetingName}, you've been added as a follower to ${startupName}. You'll receive weekly progress updates. View the startup at ${APP_URL}/startups/${startupSlug}`,
  });
}

// ===========================================
// Team Member Added Notification Email
// ===========================================

export async function sendTeamMemberAddedNotificationEmail(options: {
  to: string;
  userName: string;
  startupName: string;
  startupSlug: string;
  newMemberName: string;
  newMemberRole: string;
}): Promise<boolean> {
  const {
    to,
    userName,
    startupName,
    startupSlug,
    newMemberName,
    newMemberRole,
  } = options;

  const contentHtml = `
    <p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
      Hi ${userName}, a new team member has been added to <strong>${startupName}</strong>.
    </p>

    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
        New Team Member
      </h3>
      <p style="margin: 0 0 8px 0; color: #475569;">
        <strong>Name:</strong> ${newMemberName}
      </p>
      <p style="margin: 0; color: #475569;">
        <strong>Role:</strong> ${newMemberRole}
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Startup
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: `New team member in ${startupName}`,
    contentHtml,
    badge: "Team Update",
  });

  return sendEmail({
    to,
    subject: `New team member added to ${startupName}`,
    html,
    text: `Hi ${userName}, ${newMemberName} has been added to ${startupName} as a ${newMemberRole}. View the startup at ${APP_URL}/startups/${startupSlug}`,
  });
}

// ===========================================
// Follower Weekly Update Email (AI-Powered)
// ===========================================

interface FollowerWeeklyReportData {
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

interface FollowerAIAnalysis {
  summary: string;
  comparisonWithPrevious: string[];
  immediateActions: string[];
}

export async function sendFollowerWeeklyUpdateEmail(options: {
  to: string;
  followerName?: string | null;
  startupName: string;
  startupSlug: string;
  currentReport: FollowerWeeklyReportData;
  previousReports?: FollowerWeeklyReportData[];
  aiAnalysis?: FollowerAIAnalysis;
}): Promise<boolean> {
  const {
    to,
    followerName,
    startupName,
    startupSlug,
    currentReport,
    previousReports,
    aiAnalysis,
  } = options;

  const greetingName = followerName || "";

  const primaryFormat = currentReport.metricFormat || "NUMBER";
  const primaryValueDisplay = formatMetricValue(
    currentReport.primaryMetricValue,
    primaryFormat,
  );

  const metricDelta = currentReport.primaryMetricDelta;
  const metricDeltaDisplay =
    metricDelta !== null
      ? `${metricDelta >= 0 ? "+" : ""}${primaryFormat === "PERCENTAGE" ? `${metricDelta.toFixed(1)}%` : formatMetricValue(Math.abs(metricDelta), primaryFormat)}`
      : "No change";

  const previousMetricsHtml =
    previousReports && previousReports.length > 0
      ? `
    <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Progress Over Time</h3>
    <div style="display: grid; grid-template-columns: repeat(${Math.min(previousReports.length + 1, 4)}, 1fr); gap: 8px; margin-bottom: 24px;">
      ${[...previousReports]
        .reverse()
        .concat(currentReport)
        .map(
          (report, idx) => `
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid ${idx === previousReports.length ? "#ea580c" : "#e2e8f0"};">
          <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Week ${report.weekNumber}</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${formatMetricValue(report.primaryMetricValue, report.metricFormat || "NUMBER")}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  `
      : "";

  const aiAnalysisHtml = aiAnalysis
    ? `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; color: #334155;">
      <h3 style="font-size: 14px; font-weight: 800; color: #ea580c; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        AI Analysis
      </h3>
      <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
        ${aiAnalysis.summary}
      </p>

      ${
        aiAnalysis.comparisonWithPrevious.length > 0
          ? `
        <h4 style="font-size: 11px; font-weight: 700; color: #64748b; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          Comparison with Previous Weeks
        </h4>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
          ${aiAnalysis.comparisonWithPrevious.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join("")}
        </ul>
      `
          : ""
      }

      ${
        aiAnalysis.immediateActions.length > 0
          ? `
        <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 16px; margin-top: 16px;">
          <h4 style="font-size: 11px; font-weight: 700; color: #ea580c; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">
            Do This Now
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #431407; font-size: 13px; line-height: 1.6;">
            ${aiAnalysis.immediateActions
              .slice(0, 3)
              .map(
                (action) =>
                  `<li style="margin-bottom: 6px;"><strong>${action}</strong></li>`,
              )
              .join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
  `
    : "";

  const learningsHtml = currentReport.userLearnings
    ? `
    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        Key Learnings This Week
      </h3>
      <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
        ${currentReport.userLearnings}
      </p>
    </div>
  `
    : "";

  const goalsHtml =
    currentReport.goals && currentReport.goals.length > 0
      ? `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
        Goals for Next Week
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
        ${currentReport.goals
          .map(
            (goal, idx) => `
          <li style="margin-bottom: 8px;">
            <strong>${idx + 1}.</strong> ${goal.content}
          </li>
        `,
          )
          .join("")}
      </ul>
    </div>
  `
      : "";

  const contentHtml = `
    ${
      greetingName
        ? `<p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
        Hi${greetingName ? ` ${greetingName}` : ""}, here's the weekly progress update for <strong>${startupName}</strong>.
      </p>`
        : `<p style="font-size: 16px; color: #475569; margin: 0 0 24px 0;">
        Here's the weekly progress update for <strong>${startupName}</strong>.
      </p>`
    }

    ${aiAnalysisHtml}
    ${learningsHtml}

    <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">This Week's Numbers</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
      ${
        currentReport.isLaunched
          ? `<div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">${formatMetricLabel(currentReport.primaryMetricType, currentReport.customMetricName)}</div>
        <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${primaryValueDisplay}</div>
        <div style="font-size: 12px; color: ${metricDelta && metricDelta >= 0 ? "#16a34a" : "#dc2626"}; font-weight: 600;">${metricDeltaDisplay}</div>
      </div>`
          : ""
      }
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Users Talked To</div>
        <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${currentReport.usersTalkedTo}</div>
      </div>
      <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Morale</div>
        <div style="font-size: 24px; font-weight: 800; color: #0f172a;">${currentReport.moraleScore}/10</div>
      </div>
    </div>

    ${previousMetricsHtml}
    ${goalsHtml}

    <div style="text-align: center;">
      <a href="${APP_URL}/startups/${startupSlug}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 166, 35, 0.2);">
        View Full Dashboard
      </a>
    </div>
  `;

  const html = renderPremiumEmail({
    title: startupName,
    contentHtml,
    badge: `Week ${currentReport.weekNumber} Update`,
  });

  const textSummary = `
Hi${greetingName ? ` ${greetingName}` : ""}, here's the weekly progress update for ${startupName}.

Week ${currentReport.weekNumber} Summary:
- Primary Metric: ${primaryValueDisplay} (${metricDeltaDisplay})
- Users Talked To: ${currentReport.usersTalkedTo}
- Morale: ${currentReport.moraleScore}/10
${currentReport.userLearnings ? `- Key Learnings: ${currentReport.userLearnings.substring(0, 200)}...` : ""}

View full details at ${APP_URL}/startups/${startupSlug}
  `.trim();

  return sendEmail({
    to,
    subject: `${startupName} Weekly Update - Week ${currentReport.weekNumber}`,
    html,
    text: textSummary,
  });
}
