import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { models } from "@/lib/ai/models";
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

    const {
      messages,
      model = "primary",
      ideaId,
      vcMode = false,
    } = await req.json();

    let systemPrompt: string;

    if (vcMode) {
      systemPrompt = `You are a VC (Venture Capitalist) Coach specializing in early-stage startups. Your role is to provide honest, investor-level feedback on startups, pitches, and business strategies.

VC COACH RULES:
1. Think like an investor - focus on scalability, market size, defensibility, and team
2. Ask hard questions about revenue model, customer acquisition, and competition
3. Provide constructive criticism that helps founders improve their pitch
4. Look for red flags and areas that need more validation
5. Suggest concrete improvements to the business model or pitch
6. Be direct and honest - founders need realistic feedback, not cheerleading

KEY AREAS TO EVALUATE:
- Market opportunity and TAM (Total Addressable Market)
- Business model and monetization strategy
- Competition and moat/defensibility
- Team and founder background
- Traction and metrics
- Capital efficiency and burn rate
- Clear path to Series A

When reviewing a pitch or business, provide:
1. Overall assessment (Strong / Promising / Needs Work / Pass)
2. Key strengths
3. Critical concerns (the "kryptonite")
4. Specific recommendations
5. Questions an investor would definitely ask

If the user asks general startup questions, provide advice from an investor's perspective.`;
    } else {
      systemPrompt = `You are Ideas Vault — an AI Chief of Staff focused on helping early-stage founders decide what to do next.

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
- Which assumption, if false, kills the idea immediately?`;
    }

    if (ideaId && !vcMode) {
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

    // Use primary model by default, or specific model if requested
    let aiModel;
    if (model === "mistral" || model === "secondary") {
      aiModel = models.secondary;
    } else if (model === "google" || model === "tertiary") {
      aiModel = models.tertiary;
    } else {
      aiModel = models.primary;
    }

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
