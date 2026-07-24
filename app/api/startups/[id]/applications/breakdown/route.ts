import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { z } from "zod";
import { consumeAICredit } from "@/lib/polar/workspace-entitlements";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "edit_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing task title" }, { status: 400 });
    }

    const aiCredit = await consumeAICredit(session.user.id);
    if (!aiCredit.allowed) return NextResponse.json({ error: "Your workspace has no AI credits remaining.", code: "PLAN_LIMIT_REACHED", resource: "ai" }, { status: 402 });

    const prompt = `You are a startup operations expert.
Break down the following task into 4 to 6 actionable subtasks for an early-stage startup team.

Task Title: ${title}
Task Description: ${description || "No description provided."}

Return a list of strings representing the subtasks, e.g. ["Research competitor pricing models", "Draft initial pricing matrix tiers"].
`;

    const { result } = await generateObjectWithFallback<string[]>(
      {
        schema: z.array(z.string()),
        prompt,
      },
      "TASK_BREAKDOWN",
    );

    const subtasks = result.object;

    return NextResponse.json({ data: subtasks });
  } catch (error) {
    console.error("[TASK_BREAKDOWN_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
