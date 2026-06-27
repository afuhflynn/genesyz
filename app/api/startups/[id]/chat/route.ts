import { stepCountIs, streamText } from "ai";
import { model } from "@/lib/ai/models";
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
    const { messages, conversationId: requestedConversationId } =
      await req.json();

    // Map UI messages to CoreMessages if they are in the parts format
    const coreMessages = Array.isArray(messages)
      ? messages.map((m: any) => {
          if (m.parts && Array.isArray(m.parts)) {
            return {
              role: m.role,
              content: m.parts
                .map((p: any) => {
                  if (p.type === "text") return p.text;
                  return "";
                })
                .join("\n"),
            };
          }
          return m;
        })
      : messages;

    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let conversationId = requestedConversationId;

    // Handle persistence: Save the latest user message
    const lastMessage = coreMessages[coreMessages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      // If no conversationId provided, create a new one
      if (!conversationId) {
        const newConversation = await db.startupConversation.create({
          data: {
            startupId: access.startupId,
            title:
              lastMessage.content.substring(0, 50) +
              (lastMessage.content.length > 50 ? "..." : ""),
          },
        });
        conversationId = newConversation.id;
        console.log(`[CHAT_NEW_CONV] Created: ${conversationId}`);
      }

      // Save user message
      await db.startupMessage.create({
        data: {
          conversationId,
          role: "user",
          content: lastMessage.content,
        },
      });
      console.log(`[CHAT_USER_MSG] Saved to: ${conversationId}`);
    }

    const startup = await db.startup.findUnique({
      where: { id: access.startupId },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        stage: true,
        slug: true,
        ideaId: true,
      },
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
- Id: ${startup.id}
- Slug: ${startup.slug}
- Startup Idea ID: ${startup.ideaId}

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
- And anything based on the conversation context!

NOTE:
- If the user asks for a pitch review or market analysis, use your tools to get the most up-to-date information.
- If the user asks for a fundraising plan, use your tools to get the most up-to-date information.
- If the user asks for a hiring plan, use your tools to get the most up-to-date information.
- If the user asks for a competition plan, use your tools to get the most up-to-date information.
- If the user asks for anything related to dates, use the websearch tool to get the most up-to-date information.
- Don't use too many emojis, but feel free to use 1-2 relevant ones to make your advice more engaging and memorable (This is to make your response more human and professional)
- You have the ability to add tasks to the startup using the 'addStartupTask' tool.
- You have the ability to replace all tasks for the startup using the 'replaceAllStartupTasks' tool.
- You can also create tasks lists for the startup using the 'createStartupTaskList' tool.
- You can also get the tasks lists for the startup using  the 'getStartupTaskLists' tool.

If the user asks for a pitch review or market analysis, use your tools to get the most up-to-date information.`;

    const result = streamText({
      model,
      system: systemPrompt,
      tools: {
        ...tools,
      },
      stopWhen: stepCountIs(20),
      messages: coreMessages,
      onFinish: async ({ text, toolCalls, toolResults, usage }) => {
        try {
          console.log(
            `[CHAT_FINISH] Conversation: ${conversationId}, Text length: ${text.length}`,
          );
          if (conversationId) {
            // Save assistant message and tool results
            const assistantMessage = await db.startupMessage.create({
              data: {
                conversationId,
                role: "assistant",
                content: text || "",
                toolCalls:
                  toolCalls && toolCalls.length > 0
                    ? (toolCalls as any)
                    : undefined,
                toolResults:
                  toolResults && toolResults.length > 0
                    ? (toolResults as any)
                    : undefined,
                tokensUsed: usage.totalTokens,
              },
            });
            console.log(`[CHAT_SAVED] Message ID: ${assistantMessage.id}`);

            // Update conversation stats
            await db.startupConversation.update({
              where: { id: conversationId },
              data: {
                updatedAt: new Date(),
                messageCount: {
                  increment: 2, // User + Assistant
                },
              },
            });
          }
        } catch (e) {
          console.error("Failed to save message to DB:", e);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "x-conversation-id": conversationId || "",
      },
    });
  } catch (error) {
    console.error("Startup VC Coach API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
