import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // "week" or "month"

    // Get date ranges
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get all ideas for user
    const ideas = await db.idea.findMany({
      where: { userId, isArchived: false },
      include: {
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        snapshots: {
          orderBy: { date: "desc" },
          take: 2,
        },
      },
    });

    // Calculate metrics
    const totalIdeas = ideas.length;
    const activeIdeas = ideas.filter(
      (idea) => idea.status !== "RESEARCHED",
    ).length;
    const researchedIdeas = ideas.filter(
      (idea) => idea.status === "RESEARCHED",
    ).length;
    const totalResearched = researchedIdeas;

    // Average score
    const scoresWithData = ideas
      .flatMap((idea) => idea.scores)
      .filter((score) => score.overallScore !== null);
    const averageScore =
      scoresWithData.length > 0
        ? Math.round(
            scoresWithData.reduce(
              (sum, score) => sum + (score.overallScore || 0),
              0,
            ) / scoresWithData.length,
          )
        : 0;

    // Score change (this week vs last week)
    const thisWeekIdeas = ideas.filter(
      (idea) => new Date(idea.createdAt) >= startOfThisWeek,
    );
    const lastWeekIdeas = ideas.filter(
      (idea) =>
        new Date(idea.createdAt) >= startOfLastWeek &&
        new Date(idea.createdAt) < startOfThisWeek,
    );

    const thisWeekScores = thisWeekIdeas
      .flatMap((i) => i.scores)
      .filter((s) => s.overallScore !== null);
    const lastWeekScores = lastWeekIdeas
      .flatMap((i) => i.scores)
      .filter((s) => s.overallScore !== null);

    const thisWeekAvgScore =
      thisWeekScores.length > 0
        ? Math.round(
            thisWeekScores.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
              thisWeekScores.length,
          )
        : 0;

    const lastWeekAvgScore =
      lastWeekScores.length > 0
        ? Math.round(
            lastWeekScores.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
              lastWeekScores.length,
          )
        : 0;

    const scoreChange = thisWeekAvgScore - lastWeekAvgScore;

    // Research count change
    const thisWeekResearched = ideas.filter(
      (idea) =>
        idea.researchedAt && new Date(idea.researchedAt) >= startOfThisWeek,
    ).length;

    const lastWeekResearched = ideas.filter(
      (idea) =>
        idea.researchedAt &&
        new Date(idea.researchedAt) >= startOfLastWeek &&
        new Date(idea.researchedAt) < startOfThisWeek,
    ).length;

    const researchedChange = thisWeekResearched - lastWeekResearched;

    // Verdict breakdown (from snapshots)
    const latestSnapshots = ideas
      .flatMap((idea) => idea.snapshots)
      .filter((s) => s.verdict !== null);

    const goVerdicts = latestSnapshots.filter(
      (s) => (s.verdict as any)?.verdict === "Go",
    ).length;
    const pauseVerdicts = latestSnapshots.filter(
      (s) => (s.verdict as any)?.verdict === "Pause",
    ).length;
    const killVerdicts = latestSnapshots.filter(
      (s) => (s.verdict as any)?.verdict === "Kill",
    ).length;

    return NextResponse.json({
      totalIdeas,
      activeIdeas,
      averageScore,
      scoreChange,
      totalResearched,
      researchedChange,
      goVerdicts,
      pauseVerdicts,
      killVerdicts,
      period,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
