import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions";
import { analyzeCohortHealth } from "@/lib/agents/hub-coach";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(slug, "view_metrics");

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch Accelerator Data
  const accelerator = await db.accelerator.findUnique({
    where: { id: acceleratorId },
    include: {
      kpis: true,
      cohorts: {
        include: {
          startups: {
            include: {
              startup: {
                include: {
                  weeklyUpdates: { orderBy: { weekNumber: "desc" }, take: 1 },
                  flags: { where: { status: "active" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!accelerator) {
    return NextResponse.json({ error: "Accelerator not found" }, { status: 404 });
  }

  // 2. Prepare Data for AI Coach
  const hubContext = {
    name: accelerator.name,
    programType: accelerator.programType,
    totalStartups: accelerator.cohorts.reduce((acc, c) => acc + c.startups.length, 0),
    kpis: accelerator.kpis.map(k => ({
      name: k.name,
      target: k.targetValue,
      current: k.currentValue,
      unit: k.unit,
    })),
  };

  const startupBriefs = accelerator.cohorts.flatMap(c => 
    c.startups.map(cs => {
      const s = cs.startup;
      const latestUpdate = s.weeklyUpdates[0];
      return {
        name: s.name,
        stage: s.stage,
        lastMorale: latestUpdate?.moraleScore ?? 5,
        lastMetricDelta: latestUpdate?.primaryMetricDelta ?? null,
        flags: s.flags.map(f => f.reason),
        recentObstacles: [latestUpdate?.biggestObstacle].filter(Boolean) as string[],
      };
    })
  );

  // 3. Run AI Analysis
  try {
    const analysis = await analyzeCohortHealth(hubContext, startupBriefs);
    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error("[HUB_COACH_API] Error:", error);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
