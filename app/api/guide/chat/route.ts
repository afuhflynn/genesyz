import { streamText } from "ai";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { model } from "@/lib/ai/models";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, ideaId } = await req.json();

    if (!ideaId) {
      return NextResponse.json({ error: "Idea ID required" }, { status: 400 });
    }

    const idea = await db.idea.findUnique({
      where: { id: ideaId, userId: session.user.id },
      include: {
        scores: true,
        snapshots: { orderBy: { date: "desc" }, take: 1 },
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const latestSnapshot = idea.snapshots[0];
    const score = idea.scores[0];

    const systemPrompt = `You are an AI Guide helping the founder understand their idea research results.

IDEA CONTEXT:
- Title: ${idea.title || "Untitled"}
- Summary: ${idea.summary || "No summary"}
- Overall Score: ${score?.overallScore || "N/A"}
- Clarity: ${score?.clarityScore || "N/A"}
- Market: ${score?.marketScore || "N/A"}
- Execution: ${score?.executionScore || "N/A"}
- Target Location: ${idea.targetLocation}

${
  latestSnapshot
    ? `LATEST VERDICT:
- Verdict: ${JSON.stringify(latestSnapshot.verdict)}
`
    : ""
}

Full idea content: ${JSON.stringify(idea)}

Your role:
1. Answer questions about the research results
2. Explain scores and metrics in plain language
3. Suggest next steps based on the verdict
4. Help the founder understand strengths and weaknesses
5. Provide actionable advice

Be helpful, clear, and concise. Use the research data to inform your responses.`;

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Guide chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
    );
  }
}
