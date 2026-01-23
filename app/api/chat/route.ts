import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { tools } from "@/lib/ai/tools";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, model = "mistral", ideaId } = await req.json();

    // Build system prompt based on the "AI Interrogation" philosophy
    let systemPrompt = `You are Ideas Vault — an AI Chief of Staff focused on helping early-stage founders decide what to do next.

CORE RULES:
1. Always prioritize DECISIONS over raw analysis.
2. Where possible, produce Go / Pause / Kill as the top-level call.
3. Replace numeric scores with risk flags, assumptions, and blind spots.
4. Each verdict must include: 1 next priority, 1 stop action, 1 risk/assumption, evidence bullets, and one counter-argument.
5. Use tools to fetch idea context, research, and history.
6. If the user asks general questions, determine which tools to make use of (web search, industry news, etc.).
7. Be "brain-drilling" — ask high-pressure, high-value questions to force clarity.

BRAIN-DRILLING QUESTIONS:
- What is the single measurable outcome you want this idea to produce in 12 weeks?
- Who would pay $50 for this next week? Describe a real person.
- What is the smallest valid experiment that would prove a real user will pay or sign up this month?
- Which assumption, if false, kills the idea immediately?

When a verdict is issued, it MUST match this JSON schema:
{
  "idea_id": "string",
  "date": "string",
  "verdict": "Go|Pause|Kill",
  "one_priority": "string",
  "one_stop": "string",
  "top_risk": "string",
  "evidence": ["string"],
  "assumptions": [{"id": "string", "text": "string", "confidence": "low|med|high"}],
  "counter_argument": "string",
  "next_steps": [{"task_id": "string", "desc": "string", "owner": "string", "due": "string"}]
}`;

    if (ideaId) {
      const idea = await db.idea.findUnique({
        where: { id: ideaId, userId: session.user.id },
        select: { title: true, summary: true },
      });
      if (idea) {
        systemPrompt += `\n\nYou are currently discussing this specific idea:
Title: ${idea.title}
Summary: ${idea.summary}

Use the 'getIdeaContext' tool to fetch more details if needed.`;
      }
    }

    // Get model instance
    const aiModel =
      model === "mistral"
        ? mistral("open-mixtral-8x7b")
        : google("gemini-2.5-flash");

    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      tools: tools,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
