import { sendEmail } from "./client";

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

  <h2 style="font-size: 24px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
    Welcome, ${userName}!
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
    Thank you for joining IdeasVault. We're excited to help you capture, research, and validate your startup ideas.
  </p>

  <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
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

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #0f172a; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
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
      }" style="color: #0f172a; text-decoration: none; font-weight: 500;">
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

  <h2 style="font-size: 22px; font-weight: 600; color: #0f172a; margin-bottom: 24px;">
    Hi ${userName}, here's your weekly update
  </h2>

  <div style="display: flex; gap: 16px; margin-bottom: 32px;">
    <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0;">${totalIdeas}</p>
      <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Active Ideas</p>
    </div>
    <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0;">${averageScore}</p>
      <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Avg Score</p>
    </div>
  </div>

  ${
    topIdeas.length > 0
      ? `
    <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
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
        No ideas yet. <a href="${APP_URL}/ideas/new" style="color: #0f172a; font-weight: 600;">Capture your first idea</a>
      </p>
    </div>
  `
  }

  <div style="text-align: center; margin: 32px 0;">
    <a href="${APP_URL}/dashboard" style="display: inline-block; background: #F5A623; color: #0f172a; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
      View Dashboard
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

  <p style="font-size: 12px; color: #94a3b8; text-align: center;">
    © ${new Date().getFullYear()} IdeasVault. All rights reserved.<br>
    <a href="${APP_URL}/settings" style="color: #94a3b8;">Manage email preferences</a>
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

  <h2 style="font-size: 22px; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
    Research Complete! 🎉
  </h2>

  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
    Hi ${userName}, the AI research for your idea is ready.
  </p>

  <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0;">
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
    <a href="${APP_URL}/ideas/${ideaId}" style="display: inline-block; background: #F5A623; color: #0f172a; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
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
