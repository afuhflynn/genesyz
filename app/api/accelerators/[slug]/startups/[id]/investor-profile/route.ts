import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions-server";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id: startupId } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "view_startups",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startup = await db.startup.findUnique({
    where: {
      id: startupId,
      cohortStartups: {
        some: {
          cohort: {
            acceleratorId: acceleratorId,
          },
        },
      },
    },
    include: {
      user: { select: { name: true, email: true, image: true } },
      weeklyUpdates: {
        orderBy: { weekNumber: "desc" },
        take: 4, // Last month of progress
      },
      metrics: true,
      goals: {
        where: { completed: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      cohortStartups: {
        include: { cohort: { select: { name: true } } },
      },
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  // Synthesize "Investor Readiness" data
  const latestUpdate = startup.weeklyUpdates[0];
  const profile = {
    name: startup.name,
    tagline: startup.tagline,
    description: startup.description,
    industry: startup.industry,
    stage: startup.stage,
    website: startup.website,
    location: startup.location,
    founder: startup.user,
    cohort: startup.cohortStartups[0]?.cohort.name,
    metrics: startup.metrics,
    recentGrowth: {
      primaryMetric: startup.primaryMetricType,
      currentValue: startup.primaryMetricValue,
      history: startup.weeklyUpdates.map((u) => ({
        week: u.weekNumber,
        value: u.primaryMetricValue,
      })),
    },
    achievements: startup.goals.map((g) => g.content),
    aiInsights: latestUpdate?.aiAnalysis, // Feedback from VC AI Coach
    verdict: latestUpdate?.aiVerdict,
  };

  return NextResponse.json({ data: profile });
}
