import { sendEmail } from "./client";
import type { StrategicAdvisory } from "../agents/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ===========================================
// Welcome Email
// ===========================================

export async function sendWelcomeEmail(options: {
  to: string;
  userName: string;
}): Promise<boolean> {
  const { to, userName } = options;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to IdeasVault</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="${APP_URL}/images/logo/logo-email.png" alt="IdeasVault" width="150" height="50" style="display: block; margin: 0 auto;">
  </div>

  <h2 style="font-size: 24px; font-weight: 600; color: #F5A623; margin-bottom: 16px;">
    Welcome, ${userName}!
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
    Thank you for joining IdeasVault. We're excited to help you capture, research, and validate your startup ideas.
  </p>

  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #F5A623; margin: 0 0 12px 0;">
      Here's what you can do:
    </h3>
    <ul style="margin: 0; padding-left: 20px; color: #475569;">
      <li style="margin-bottom: 8px;">Capture ideas via text, voice, or images</li>
      <li style="margin-bottom: 8px;">Get AI-powered market research</li>
      <li style="margin-bottom: 8px;">Receive actionable insights and scores</li>
      <li style="margin-bottom: 8px;">Export research as professional PDFs</li>
    </ul>
  </div>

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #fffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      Go to Dashboard
    </a>
  </div>

  <p style="font-size: 14px; color: #64748b; text-align: center;">
    Questions? Just reply to this email.
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    © ${new Date().getFullYear()} IdeasVault. All rights reserved.
  </p>
</body>
</html>
  `;

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
      }" style="color: #fffff; text-decoration: none; font-weight: 500;">
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
        idea.score >= 70 ? "#166534" : idea.score >= 50 ? "#a16207" : "#dc2626"
      }; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600;">
              ${idea.score}
            </span>
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly IdeasVault Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="${APP_URL}/images/logo/logo-email.png" alt="IdeasVault" width="150" height="50" style="display: block; margin: 0 auto;">
    <p style="font-size: 14px; color: #64748b; margin: 8px 0 0 0;">Weekly Digest</p>
  </div>

  <h2 style="font-size: 22px; font-weight: 600; color: #F5A623; margin-bottom: 24px;">
    Hi ${userName}, here's your weekly update
  </h2>

  <div style="display: flex; gap: 16px; margin-bottom: 32px;">
    <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="font-size: 32px; font-weight: 700; color: #F5A623; margin: 0;">${totalIdeas}</p>
      <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Active Ideas</p>
    </div>
    <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="font-size: 32px; font-weight: 700; color: #F5A623; margin: 0;">${averageScore}</p>
      <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Avg Score</p>
    </div>
  </div>

  ${
    topIdeas.length > 0
      ? `
    <h3 style="font-size: 18px; font-weight: 600; color: #F5A623; margin-bottom: 16px;">
      Your Top Ideas
    </h3>
    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <tbody>
        ${topIdeasHtml}
      </tbody>
    </table>
  `
      : `
    <div style="background: #f8fafc; border-radius: 12px; padding: 32px; text-align: center;">
      <p style="font-size: 16px; color: #64748b; margin: 0;">
        No ideas yet. <a href="${APP_URL}/ideas/new" style="color: #fffff; font-weight: 600;">Capture your first idea</a>
      </p>
    </div>
  `
  }

  <div style="text-align: center; margin: 32px 0;">
    <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #fffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      View Dashboard
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    © ${new Date().getFullYear()} IdeasVault. All rights reserved.<br>
    <a href="${APP_URL}/settings" style="color: #000000;">Manage email preferences</a>
  </p>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Your Weekly IdeasVault Digest - ${totalIdeas} ideas, avg score ${averageScore}`,
    html,
    text: `Hi ${userName}, you have ${totalIdeas} active ideas with an average score of ${averageScore}. Visit ${APP_URL}/dashboard to see more.`,
  });
}

export async function sendStrategicAdvisoryEmail(options: {
  to: string;
  userName: string;
  advisory: StrategicAdvisory;
}): Promise<boolean> {
  const { to, userName, advisory } = options;

  const marketPulseHtml = advisory.marketPulse
    .map(
      (item) => `
    <div style="margin-bottom: 20px; padding: 16px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 4px solid ${
      item.impactOnPortfolio === "positive"
        ? "#10b981"
        : item.impactOnPortfolio === "negative"
        ? "#ef4444"
        : "#64748b"
    };">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0; flex: 1;">${
          item.newsItem
        }</p>
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background: ${
          item.impactOnPortfolio === "positive"
            ? "#dcfce7"
            : item.impactOnPortfolio === "negative"
            ? "#fee2e2"
            : "#f1f5f9"
        }; color: ${
        item.impactOnPortfolio === "positive"
          ? "#166534"
          : item.impactOnPortfolio === "negative"
          ? "#991b1b"
          : "#475569"
      }; margin-left: 12px; white-space: nowrap;">${
        item.impactOnPortfolio
      }</span>
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0;">${
        item.relevance
      }</p>
    </div>
  `
    )
    .join("");

  const recommendationsHtml = advisory.strategicRecommendations
    .map(
      (rec) => `
    <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
      <div style="display: flex; align-items: center; margin-bottom: 6px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${
          rec.priority === "high"
            ? "#ef4444"
            : rec.priority === "medium"
            ? "#f59e0b"
            : "#94a3b8"
        }; margin-right: 10px;"></span>
        <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">${
          rec.ideaTitle
        }</p>
      </div>
      <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 0 18px;">${
        rec.recommendation
      }</p>
    </div>
  `
    )
    .join("");

  const actionPlanHtml = advisory.weeklyActionPlan
    .map(
      (step) => `
    <li style="margin-bottom: 12px; font-size: 14px; color: #334155; display: flex; align-items: flex-start;">
      <span style="color: #F5A623; margin-right: 12px; font-weight: bold;">•</span>
      <span>${step}</span>
    </li>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Strategic Advisory Report</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc;">
  <div style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
    <!-- Header -->
    <div style="background: #0f172a; padding: 48px 32px; text-align: center; color: #ffffff; position: relative;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at top right, #334155 0%, transparent 70%); opacity: 0.5;"></div>
      <img src="${APP_URL}/images/logo/logo-email-white.png" alt="IdeasVault" width="140" style="margin-bottom: 24px; position: relative; z-index: 1;">
      <div style="display: inline-block; padding: 4px 12px; background: rgba(245, 166, 35, 0.2); border: 1px solid #F5A623; border-radius: 9999px; margin-bottom: 16px; position: relative; z-index: 1;">
        <span style="font-size: 11px; font-weight: 800; color: #F5A623; letter-spacing: 0.1em; text-transform: uppercase;">Premium Advisory</span>
      </div>
      <h1 style="font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.03em; position: relative; z-index: 1; color: #ffffff;">Weekly Strategic Report</h1>
      <p style="font-size: 14px; color: #94a3b8; margin: 12px 0 0 0; position: relative; z-index: 1;">Prepared for ${userName} • ${new Date().toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  )}</p>
    </div>

    <div style="padding: 40px 32px;">
      <!-- Executive Summary -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <span style="font-size: 16px;">📝</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Executive Summary</h2>
        </div>
        <p style="font-size: 15px; color: #475569; margin: 0; line-height: 1.7; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9;">${
          advisory.executiveSummary
        }</p>
      </div>

      <!-- Portfolio Themes -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <span style="font-size: 16px;">🎯</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Portfolio Themes</h2>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${advisory.portfolioThemes
            .map(
              (theme) => `
            <span style="padding: 6px 14px; background: #f1f5f9; color: #475569; border-radius: 9999px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0;">${theme}</span>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Market Pulse -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <span style="font-size: 16px;">⚡</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Market Pulse</h2>
        </div>
        ${marketPulseHtml}
      </div>

      <!-- Strategic Recommendations -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <span style="font-size: 16px;">💡</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Strategic Roadmap</h2>
        </div>
        <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 24px;">
          ${recommendationsHtml}
        </div>
      </div>

      <!-- VC Corner -->
      <div style="margin-bottom: 40px; background: #0f172a; border-radius: 20px; padding: 32px; color: #ffffff; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: #F5A623; opacity: 0.1; border-radius: 50%;"></div>
        <h2 style="font-size: 18px; font-weight: 800; color: #F5A623; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.1em;">
          VC Corner
        </h2>
        <div style="margin-bottom: 20px;">
          <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin: 0 0 4px 0; letter-spacing: 0.05em;">Market Sentiment</p>
          <p style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0;">${
            advisory.vcCorner.sentiment
          }</p>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin: 0 0 8px 0; letter-spacing: 0.05em;">The Hard Truth</p>
          <p style="font-size: 15px; color: #e2e8f0; font-style: italic; line-height: 1.6; margin: 0;">"${
            advisory.vcCorner.brutalHonesty
          }"</p>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 13px; font-weight: 700; color: #94a3b8;">INVESTMENT POTENTIAL</span>
          <span style="font-size: 13px; font-weight: 800; color: ${
            advisory.vcCorner.investmentPotential === "high"
              ? "#10b981"
              : advisory.vcCorner.investmentPotential === "medium"
              ? "#F5A623"
              : "#ef4444"
          }; text-transform: uppercase;">${
    advisory.vcCorner.investmentPotential
  }</span>
        </div>
      </div>

      <!-- Action Plan -->
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <span style="font-size: 16px;">🚀</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Weekly Action Plan</h2>
        </div>
        <ul style="margin: 0; padding: 0; list-style: none;">
          ${actionPlanHtml}
        </ul>
      </div>

      <!-- Footer CTA -->
      <div style="text-align: center; padding-top: 32px; border-top: 1px solid #f1f5f9;">
        <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(245, 166, 35, 0.3);">
          Open Full Portfolio Analysis
        </a>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-bottom: 40px;">
    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
      This is a premium strategic advisory report generated by IdeasVault AI.
    </p>
    <p style="font-size: 12px; color: #94a3b8;">
      © ${new Date().getFullYear()} IdeasVault. All rights reserved.<br>
      <a href="${APP_URL}/settings" style="color: #64748b; text-decoration: underline;">Manage Preferences</a> • <a href="${APP_URL}/settings" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Strategic Advisory: ${
      advisory.portfolioThemes[0] || "Weekly Portfolio Update"
    }`,
    html,
    text: `Your Weekly Strategic Advisory Report is ready. Executive Summary: ${advisory.executiveSummary}`,
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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research Complete</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="${APP_URL}/images/logo/logo-email.png" alt="IdeasVault" width="150" height="50" style="display: block; margin: 0 auto;">
  </div>

  <h2 style="font-size: 22px; font-weight: 600; color: #F5A623; margin-bottom: 16px;">
    Research Complete! 🎉
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
    Hi ${userName}, the AI research for your idea is ready.
  </p>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #F5A623; margin: 0 0 16px 0;">
      ${ideaTitle}
    </h3>

    <div style="display: flex; gap: 16px; align-items: center;">
      <div style="text-align: center;">
        <p style="font-size: 36px; font-weight: 700; color: ${
          overallScore >= 70
            ? "#166534"
            : overallScore >= 50
            ? "#a16207"
            : "#dc2626"
        }; margin: 0;">
          ${overallScore}
        </p>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Overall Score</p>
      </div>
      <div style="flex: 1;">
        <span style="display: inline-block; background: ${
          verdictStyle.bg
        }; color: ${
    verdictStyle.text
  }; padding: 6px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: capitalize;">
          ${verdict.replace(/-/g, " ")}
        </span>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${APP_URL}/ideas/${ideaId}" style="display: inline-block; background: #F5A623; color: #fffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      View Full Research
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    © ${new Date().getFullYear()} IdeasVault. All rights reserved.
  </p>
</body>
</html>
  `;

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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="${APP_URL}/images/logo/logo-email.png" alt="IdeasVault" width="150" height="50" style="display: block; margin: 0 auto;">
  </div>

  <h2 style="font-size: 22px; font-weight: 600; color: #F5A623; margin-bottom: 16px; text-align: center;">
    Verify your email address
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px; text-align: center;">
    Hi ${userName}, please use the code below to verify your email address and complete your registration.
  </p>

  <div style="background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
    <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #F5A623; margin-bottom: 8px;">
      ${code}
    </div>
    <p style="font-size: 14px; color: #94a3b8; margin: 0;">
      This code expires in 24 hours.
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 32px;">
    <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">
      Or click the button below to verify directly:
    </p>
    <a href="${url}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
      Verify Email
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    If you didn't create an account, you can safely ignore this email.
  </p>
</body>
</html>
  `;

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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="${APP_URL}/images/logo/logo-email.png" alt="IdeasVault" width="150" height="50" style="display: block; margin: 0 auto;">
  </div>

  <h2 style="font-size: 22px; font-weight: 600; color: #F5A623; margin-bottom: 16px; text-align: center;">
    Reset your password
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px; text-align: center;">
    Hi ${userName}, we received a request to reset your password. Click the button below to choose a new one.
  </p>

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${url}" style="display: inline-block; background: #F5A623; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      Reset Password
    </a>
  </div>

  <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
    This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    © ${new Date().getFullYear()} IdeasVault. All rights reserved.
  </p>
</body>
</html>
  `;

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

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to IdeasVault</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="${APP_URL}/images/logo/logo-email.png" alt="IdeasVault" width="150" height="50" style="display: block; margin: 0 auto;">
  </div>

  <h2 style="font-size: 22px; font-weight: 600; color: #F5A623; margin-bottom: 16px; text-align: center;">
    Sign in to your account
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px; text-align: center;">
    Click the button below to sign in to your IdeasVault account. This link will expire in 10 minutes.
  </p>

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${url}" style="display: inline-block; background: #F5A623; color: #fffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      Sign In to IdeasVault
    </a>
  </div>

  <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
    If you didn't request this link, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    © ${new Date().getFullYear()} IdeasVault. All rights reserved.
  </p>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: "Sign in to IdeasVault",
    html,
    text: `Sign in to IdeasVault here: ${url}`,
  });
}
