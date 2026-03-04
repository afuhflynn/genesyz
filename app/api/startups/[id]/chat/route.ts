import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { tools } from "@/lib/ai/tools";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const { messages, conversationId } = await req.json();

    // Map UI messages to CoreMessages if they are in the parts format
    const coreMessages = Array.isArray(messages) ? messages.map((m: any) => {
      if (m.parts && Array.isArray(m.parts)) {
        return {
          role: m.role,
          content: m.parts.map((p: any) => {
            if (p.type === 'text') return p.text;
            return '';
          }).join('\n')
        };
      }
      return m;
    }) : messages;

    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const startup = await db.startup.findUnique({
      where: { id: access.startupId },
      select: { id: true, name: true, description: true, industry: true, stage: true },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const systemPrompt = `You are a world-class Venture Capital (VC) Coach and Strategic Advisor. Your mission is to help founders scale their startups from idea to series A and beyond.

STARTUP CONTEXT:
- Name: ${startup.name}
- Stage: ${startup.stage}
- Industry: ${startup.industry || "Not specified"}
- Description: ${startup.description || "Not specified"}

YOUR COACHING PHILOSOPHY:
1. BE STRATEGIC: Don't just answer questions; think 3 steps ahead. What is the most critical hurdle this startup faces right now?
2. INVESTOR PERSPECTIVE: Evaluate everything through the lens of a VC. What would make this startup a "unicorn"? What are the red flags?
3. DATA-DRIVEN: Use the 'getStartupContext' tool to fetch the latest metrics, weekly updates, and tasks to provide personalized advice.
4. ACTION-ORIENTED: Every session should end with clear, high-impact "Next Actions".
5. HONEST BUT SUPPORTIVE: Provide "hard truths" about the business model, competition, or execution speed.

THINKING PROCESS:
Before providing your final strategic advice, you MUST perform a deep internal analysis. Wrap this analysis in <thinking> tags. 
In your thinking process:
- Evaluate the data retrieved from tools.
- Identify hidden risks or counter-intuitive opportunities.
- Plan how to deliver the "hard truth" effectively.
- Formulate the top 3 next actions.

KEY TOPICS YOU COVER:
- Pitch Deck & Storytelling: Help refine the narrative for investors.
- Growth Strategy: Suggest customer acquisition channels and retention tactics.
- Product-Market Fit: Help analyze user feedback and metrics.
- Fundraising: When to raise, how much, and from whom.
- Hiring & Team: Advice on early-core-team building.
- Competition: Use 'webSearch' and 'getCompetitorUpdates' to stay ahead.

If the user asks for a pitch review or market analysis, use your tools to get the most up-to-date information.`;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      tools: {
        ...tools,
      },
      messages: coreMessages,
      onFinish: async ({ text, toolCalls, toolResults, usage }) => {
        try {
          if (conversationId) {
            // Update existing conversation logic here
          }
        } catch (e) {
          console.error("Failed to save message to DB:", e);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Startup VC Coach API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
