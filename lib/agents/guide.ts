/**
 * AI Guide Agent
 * Conversational agent for deep-dive research exploration
 */

import type { ResearchPacket } from "@prisma/client";
import { stepCountIs, streamText } from "ai";
import { generateTextWithFallback } from "@/lib/ai/fallback";
import { model } from "@/lib/ai/models";
import { tools } from "@/lib/ai/tools";
import { db } from "@/lib/db";

// Message type for AI SDK
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const GUIDE_SYSTEM_PROMPT = `You are an expert AI Research Guide for startup founders. Your role is to help users deeply understand and explore their research results through conversation.

Key Capabilities:
1. Explain research findings in simple, actionable terms
2. Answer follow-up questions about market data, competitors, trends
3. Provide additional context and insights not in the original research
4. Help users refine their understanding of their idea
5. Suggest next steps and validation experiments
6. Compare original user prompt with AI interpretation

Guidelines:
- Be conversational but professional
- Reference specific data from the research packets
- If you don't know something, say so and suggest using the web search tool
- Help users identify gaps in their thinking
- Be encouraging but honest about challenges
- When comparing original vs interpreted prompt, highlight key differences neutrally
- Use tools when additional research is needed to answer questions

You have access to all research data and can use web search tools to find additional information when needed.`;

export interface GuideContext {
  ideaId: string;
  userId: string;
  originalPrompt: string | null;
  interpretedPrompt: string | null;
  researchPackets: ResearchPacket[];
  locationContext: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    isGlobal?: boolean;
  } | null;
}

export interface GuideMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  createdAt: Date;
}

export interface GuideResponse {
  message: GuideMessage;
  conversationId: string;
  tokensUsed?: number;
}

/**
 * Build context from all research packets
 */
function buildResearchContext(packets: ResearchPacket[]): string {
  const sections: string[] = [];

  for (const packet of packets) {
    const content = packet.content as any;

    switch (packet.agentType) {
      case "INTERPRETER":
        sections.push(`## Idea Overview
**Title:** ${content.title}
**Summary:** ${content.summary}
**Problem:** ${content.problemStatement}
**Solution:** ${content.proposedSolution}
**Target Audience:** ${content.targetAudience?.join(", ")}
**Category:** ${content.category}`);
        break;

      case "MARKET_RESEARCH": {
        const marketSize = content.marketSize;
        sections.push(`## Market Research
**Global Market:**
- TAM: ${marketSize?.global?.tam?.value || "N/A"}
- SAM: ${marketSize?.global?.sam?.value || "N/A"}
- SOM: ${marketSize?.global?.som?.value || "N/A"}
- Growth: ${marketSize?.global?.growthRate?.value || "N/A"}
${
  marketSize?.regional
    ? `**Regional Market:**
- TAM: ${marketSize.regional.tam?.value || "N/A"}`
    : ""
}
**Competitors:** ${content.competitors?.map((c: any) => c.name).join(", ") || "N/A"}
**Trends:** ${content.marketTrends?.join("; ") || "N/A"}
**Barriers:** ${content.barriers?.join("; ") || "N/A"}
**Opportunities:** ${content.opportunities?.join("; ") || "N/A"}`);
        break;
      }

      case "TREND_ANALYSIS":
        sections.push(`## Trend Analysis
**Timing:** ${content.timingAssessment?.verdict} - ${content.timingAssessment?.reasoning}
**Technology Readiness:** ${content.technologyReadiness?.score}/10 - ${content.technologyReadiness?.explanation}
**Relevant Trends:** ${content.relevantTrends?.map((t: any) => t.trend).join("; ") || "N/A"}`);
        break;

      case "EXECUTION_FRICTION":
        sections.push(`## Execution Analysis
**Technical Complexity:** ${content.technicalComplexity?.score}/10
**Time to MVP:** ${content.resourceRequirements?.timeToMvp}
**Team Size:** ${content.resourceRequirements?.teamSize}
**Budget Estimate:** ${content.resourceRequirements?.estimatedBudget}
**Key Risks:** ${content.riskFactors?.map((r: any) => `${r.risk} (${r.severity})`).join("; ") || "N/A"}`);
        break;

      case "DEEP_RESEARCH":
        sections.push(`## Deep Research
**Market Gaps:** ${content.marketGaps?.map((g: any) => g.gap).join("; ") || "N/A"}
**Strategic Moat:** ${content.strategicMoat || "N/A"}
**Pivot Options:** ${content.pivotOptions?.map((p: any) => p.direction).join("; ") || "N/A"}`);
        break;

      case "SYNTHESIS":
        sections.push(`## Synthesis & Verdict
**Overall Score:** ${content.scores?.overall?.score}/100
**Verdict:** ${content.verdict}
**Overall Assessment:** ${content.overallAssessment}
**Key Recommendations:**
${content.recommendations?.map((r: any) => `- [${r.priority}] ${r.action}`).join("\n") || "N/A"}`);
        break;
    }
  }

  return sections.join("\n\n");
}

/**
 * Initialize a new guide conversation
 */
export async function initializeGuideConversation(
  context: GuideContext,
): Promise<{ conversationId: string; initialMessage: string }> {
  const { ideaId, userId, originalPrompt, interpretedPrompt, researchPackets } =
    context;

  // Create conversation record
  const conversation = await db.guideConversation.create({
    data: {
      ideaId,
      title: "Research Deep Dive",
      isActive: true,
    },
  });

  // Build system message with full context
  const researchContext = buildResearchContext(researchPackets);

  const systemMessage = `${GUIDE_SYSTEM_PROMPT}

## Research Context

${researchContext}

## Prompt Context
${originalPrompt ? `**Original User Prompt:**\n${originalPrompt}\n` : ""}
${interpretedPrompt ? `**AI Interpretation:**\n${interpretedPrompt}\n` : ""}

## Guidelines for This Conversation
1. You have access to all the research data above
2. You can use web search tools to find additional information
3. Help the user understand nuances, validate assumptions, or explore specific aspects deeper
4. If the user asks about what you understood from their original prompt, compare it with the interpretation
5. Be proactive in suggesting follow-up questions or areas to explore
6. Keep responses concise but informative (2-4 paragraphs max)

Start by offering to help the user explore their research results.`;

  // Store system message
  await db.guideMessage.create({
    data: {
      conversationId: conversation.id,
      role: "SYSTEM",
      content: systemMessage,
    },
  });

  // Generate initial greeting
  const initialPrompt = `The user has just started a conversation about their startup idea. Provide a welcoming, brief introduction acknowledging their research is complete and offer specific ways you can help them explore it further. Mention:
1. You can explain any part of the research
2. You can dive deeper into competitors, market size, or execution challenges
3. You can help them understand what the AI understood vs what they meant
4. You can suggest next steps or validation experiments

Keep it friendly and encouraging (2-3 sentences).`;

  const { result } = await generateTextWithFallback({
    system: systemMessage,
    prompt: initialPrompt,
  }, "AI_GUIDE_INIT");

  // Store initial assistant message
  await db.guideMessage.create({
    data: {
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: result.text,
      tokensUsed: result.usage?.totalTokens,
    },
  });

  // Update conversation message count
  await db.guideConversation.update({
    where: { id: conversation.id },
    data: { messageCount: 2 },
  });

  return {
    conversationId: conversation.id,
    initialMessage: result.text,
  };
}

/**
 * Send a message to the guide and get a response
 */
export async function sendGuideMessage(
  conversationId: string,
  message: string,
  userId: string,
): Promise<GuideResponse> {
  // Verify conversation exists and user has access
  const conversation = await db.guideConversation.findFirst({
    where: {
      id: conversationId,
      idea: { userId },
      isActive: true,
    },
    include: {
      idea: {
        select: {
          id: true,
          originalPrompt: true,
          interpretedPrompt: true,
          locationContext: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 20, // Last 20 messages for context
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Store user message
  await db.guideMessage.create({
    data: {
      conversationId,
      role: "USER",
      content: message,
    },
  });

  // Build message history
  const messages: ChatMessage[] = conversation.messages.map((m: any) => ({
    role: m.role.toLowerCase() as "user" | "assistant" | "system",
    content: m.content,
  }));

  // Add the new user message
  messages.push({
    role: "user",
    content: message,
  });

  // Generate response with tools
  const { result } = await generateTextWithFallback({
    messages,
    tools,
  }, "AI_GUIDE_MESSAGE");

  // Store assistant response
  const assistantMessage = await db.guideMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content: result.text,
      toolCalls: result.toolCalls as any,
      toolResults: result.toolResults as any,
      tokensUsed: result.usage?.totalTokens,
    },
  });

  // Update conversation
  await db.guideConversation.update({
    where: { id: conversationId },
    data: {
      messageCount: { increment: 2 },
      updatedAt: new Date(),
    },
  });

  return {
    message: {
      id: assistantMessage.id,
      role: "assistant",
      content: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      createdAt: assistantMessage.createdAt,
    },
    conversationId,
    tokensUsed: result.usage?.totalTokens,
  };
}

/**
 * Stream a guide response for real-time UI updates
 */
export async function streamGuideMessage(
  conversationId: string,
  message: string,
  userId: string,
) {
  // Similar to sendGuideMessage but returns a stream
  const conversation = await db.guideConversation.findFirst({
    where: {
      id: conversationId,
      idea: { userId },
      isActive: true,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 20,
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  // Store user message
  await db.guideMessage.create({
    data: {
      conversationId,
      role: "USER",
      content: message,
    },
  });

  // Build message history
  const messages: ChatMessage[] = conversation.messages.map((m: any) => ({
    role: m.role.toLowerCase() as "user" | "assistant" | "system",
    content: m.content,
  }));

  messages.push({
    role: "user",
    content: message,
  });

  const result = streamText({
    model,
    messages,
    tools,
    stopWhen: stepCountIs(3),
  });

  return result.toTextStreamResponse();
}

/**
 * Get conversation history
 */
export async function getGuideConversation(
  conversationId: string,
  userId: string,
) {
  const conversation = await db.guideConversation.findFirst({
    where: {
      id: conversationId,
      idea: { userId },
    },
    include: {
      messages: {
        where: { role: { not: "SYSTEM" } }, // Exclude system messages
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return conversation;
}

/**
 * List all conversations for an idea
 */
export async function listGuideConversations(ideaId: string, userId: string) {
  const conversations = await db.guideConversation.findMany({
    where: {
      ideaId,
      idea: { userId },
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      messageCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return conversations;
}

/**
 * Archive/deactivate a conversation
 */
export async function archiveGuideConversation(
  conversationId: string,
  userId: string,
) {
  const conversation = await db.guideConversation.findFirst({
    where: {
      id: conversationId,
      idea: { userId },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  await db.guideConversation.update({
    where: { id: conversationId },
    data: { isActive: false },
  });

  return { success: true };
}

/**
 * Generate prompt contextualization comparison
 * Shows what the AI understood vs the original prompt
 */
export async function generatePromptContextualization(
  originalPrompt: string,
  interpretedPrompt: string,
): Promise<{
  summary: string;
  keyDifferences: string[];
  clarifyingQuestions: string[];
}> {
  const prompt = `Compare the original user prompt with the AI interpretation and provide analysis:

**Original Prompt:**
${originalPrompt}

**AI Interpretation:**
${interpretedPrompt}

Provide a JSON response with:
1. summary: A brief summary of how well the AI understood the user's intent (1-2 sentences)
2. keyDifferences: Array of 2-4 specific differences or additions the AI made
3. clarifyingQuestions: Array of 2-3 questions the user could answer to improve the interpretation

Be constructive and helpful. Focus on substantive differences, not minor wording changes.`;

  try {
    const { result } = await generateTextWithFallback({
      system:
        "You are an expert at analyzing communication and interpretation accuracy.",
      prompt,
    }, "AI_GUIDE_CONTEXTUALIZATION");

    // Try to parse as JSON, fallback to text analysis
    try {
      const parsed = JSON.parse(result.text);
      return {
        summary: parsed.summary || "Analysis completed.",
        keyDifferences: parsed.keyDifferences || [],
        clarifyingQuestions: parsed.clarifyingQuestions || [],
      };
    } catch {
      // Fallback: return text as summary
      return {
        summary: result.text,
        keyDifferences: [],
        clarifyingQuestions: [],
      };
    }
  } catch (error) {
    console.error("Error generating contextualization:", error);
    return {
      summary: "Unable to analyze differences at this time.",
      keyDifferences: [],
      clarifyingQuestions: [],
    };
  }
}
