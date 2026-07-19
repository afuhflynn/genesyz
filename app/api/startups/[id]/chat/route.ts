import { isStepCount } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { streamTextWithFallback } from "@/lib/ai/stream-fallback";
import { tools } from "@/lib/ai/tools";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import {
  searchMemories,
  addMemories,
  formatMemoriesForPrompt,
  isMemoryEnabled,
} from "@/lib/memory/client";

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

    // Map UI messages to CoreMessages and sanitize formats (e.g. tool results and calls)
    const coreMessages = Array.isArray(messages)
      ? (messages as Record<string, unknown>[]).map((m) => {
          if (Array.isArray(m.content)) {
            const sanitizedContent = (m.content as Record<string, unknown>[]).map((part) => {
              if (part && typeof part === "object") {
                if (part.type === "tool-result") {
                  return {
                    type: "tool-result",
                    toolCallId: part.toolCallId as string,
                    toolName: part.toolName as string,
                    result: part.result !== undefined ? part.result : part.output,
                    isError: part.isError as boolean | undefined,
                  };
                }
                if (part.type === "tool-call") {
                  const args = part.args !== undefined ? part.args : part.arguments;
                  const func = part.function as { name?: string } | undefined;
                  return {
                    type: "tool-call",
                    toolCallId: (part.toolCallId || part.id) as string,
                    toolName: (part.toolName || func?.name) as string,
                    args: typeof args === "string" ? JSON.parse(args) : args,
                  };
                }
              }
              return part;
            });
            return { ...m, content: sanitizedContent };
          }

          if (m.parts && Array.isArray(m.parts)) {
            return {
              role: m.role as string,
              content: (m.parts as Record<string, unknown>[])
                .map((p) => {
                  if (p.type === "text") return p.text as string;
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

    // Retrieve relevant memories from past conversations
    const lastUserQuery = coreMessages
      .filter((m: any) => m.role === "user")
      .pop()?.content || "";
    const [userMemories, startupMemories] = await Promise.all([
      searchMemories(lastUserQuery, {
        userId: session.user.id,
        startupId: access.startupId,
      }),
      searchMemories(lastUserQuery, {
        startupId: access.startupId,
      }),
    ]);
    const memoryContext = formatMemoriesForPrompt([
      ...userMemories.filter(
        (m) => !startupMemories.some((sm) => sm.id === m.id),
      ),
      ...startupMemories,
    ]);

    const systemPrompt = `You are a world-class Venture Capital (VC) Coach and Strategic Advisor. Your mission is to help founders scale their startups from idea to series A and beyond.${memoryContext}

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

    console.log("[CHAT_API] Sanitized coreMessages:", JSON.stringify(coreMessages, null, 2));

    const result = await streamTextWithFallback(
      {
        instructions: systemPrompt,
        tools: {
          ...tools,
        },
        stopWhen: isStepCount(20),
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

            // Store memories from this exchange
            const userMsg = coreMessages[coreMessages.length - 1];
            if (userMsg && userMsg.role === "user" && text) {
              await addMemories(
                [
                  { role: "user", content: userMsg.content },
                  { role: "assistant", content: text },
                ],
                {
                  userId: session.user.id,
                  startupId: access.startupId,
                  conversationId: conversationId ?? undefined,
                },
              );
            }
          }
        } catch (e) {
          console.error("Failed to save message to DB:", e);
        }
      },
    },
      "STARTUP_COACH",
    );

    const textStreamResponse = result.toTextStreamResponse();
    return new Response(textStreamResponse.body, {
      status: textStreamResponse.status,
      statusText: textStreamResponse.statusText,
      headers: {
        ...Object.fromEntries(textStreamResponse.headers.entries()),
        "x-conversation-id": conversationId || "",
        "Access-Control-Expose-Headers": "x-conversation-id",
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
