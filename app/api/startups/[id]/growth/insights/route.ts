import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObjectWithFallback } from "@/lib/ai/fallback";
import { ajAI, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildFunnelInsights } from "@/lib/growth/analytics";
import { checkWorkspaceCapability, consumeAICredit, entitlementErrorResponse, refundAICredit } from "@/lib/polar/workspace-entitlements";
import { checkStartupAccess } from "@/lib/startup-permissions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkStartupAccess((await params).id, "view_startup");
  if (!access.hasAccess || !access.startupId)
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  try { await checkWorkspaceCapability(session.user.id, "growthOS", access.startupId); } catch (error) { const response = entitlementErrorResponse(error); if (response) return response; throw error; }
  const decision = await checkRateLimit(request, session.user.id, ajAI);
  if (decision) return rateLimitResponse(decision);
  const credit = await consumeAICredit(session.user.id);
  if (!credit.allowed)
    return NextResponse.json(
      { error: "Your workspace has no AI credits remaining." },
      { status: 402 },
    );
  try {
    const [startup, campaigns, personas, experiments, events] =
      await Promise.all([
        db.startup.findUnique({
          where: { id: access.startupId },
          select: { name: true, description: true, industry: true },
        }),
        db.growthCampaign.findMany({
          where: { startupId: access.startupId },
          select: { name: true, status: true, channel: true, budget: true },
        }),
        db.customerPersona.findMany({
          where: { startupId: access.startupId },
          select: { name: true, description: true, score: true },
        }),
        db.growthExperiment.findMany({
          where: { startupId: access.startupId },
          select: {
            title: true,
            hypothesis: true,
            metrics: true,
            status: true,
            conclusion: true,
            learnings: true,
          },
        }),
        db.growthEvent.findMany({
          where: { startupId: access.startupId },
          select: {
            stage: true,
            count: true,
            value: true,
            eventName: true,
            source: true,
          },
        }),
      ]);
    const funnel = buildFunnelInsights(events);
    const { result } = await generateObjectWithFallback<{
      summary: string;
      findings: Array<{
        title: string;
        severity: "HIGH" | "MEDIUM" | "LOW";
        evidence: string;
        action: string;
        nextExperiment: string;
      }>;
    }>(
      {
        schema: z.object({
          summary: z.string(),
          findings: z
            .array(
              z.object({
                title: z.string(),
                severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
                evidence: z.string(),
                action: z.string(),
                nextExperiment: z.string(),
              }),
            )
            .max(8),
        }),
        system:
          "You are GrowthOS, a rigorous startup growth analyst. Ground every finding in supplied data. Do not invent metrics.",
        prompt: JSON.stringify({
          startup,
          campaigns,
          personas,
          experiments,
          funnel,
        }),
      },
      "GROWTH_INSIGHTS",
    );
    return NextResponse.json({
      data: { ...result.object, generatedAt: new Date().toISOString(), funnel },
    });
  } catch (error) {
    await refundAICredit(session.user.id);
    console.error("[GROWTH_INSIGHTS_POST]", error);
    return NextResponse.json(
      { error: "Unable to generate GrowthOS insights." },
      { status: 500 },
    );
  }
}
