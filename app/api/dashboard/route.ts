import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getUserUsage } from "@/lib/polar/entitlements";

// GET /api/dashboard - Get dashboard data
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get usage data
  const usage = await getUserUsage(userId);

  // Get idea statistics
  const [totalIdeas, researchedIdeas, recentIdeas, topIdeas] =
    await Promise.all([
      // Total ideas
      db.idea.count({
        where: { userId, isArchived: false },
      }),

      // Researched ideas
      db.idea.count({
        where: { userId, isArchived: false, status: "RESEARCHED" },
      }),

      // Recent ideas (last 5)
      db.idea.findMany({
        where: { userId, isArchived: false },
        include: {
          inputs: true,
          scores: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          researchPackets: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Top ideas by score
      db.idea.findMany({
        where: {
          userId,
          isArchived: false,
          status: "RESEARCHED",
          scores: { some: {} },
        },
        include: {
          inputs: true,
          scores: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          researchPackets: true,
        },
        orderBy: {
          scores: {
            _count: "desc",
          },
        },
        take: 5,
      }),
    ]);

  // Sort top ideas by score
  const sortedTopIdeas = topIdeas.sort((a, b) => {
    const scoreA = a.scores[0]?.overallScore || 0;
    const scoreB = b.scores[0]?.overallScore || 0;
    return scoreB - scoreA;
  });

  // Calculate average score
  const ideasWithScores = sortedTopIdeas.filter(
    (i) => i.scores[0]?.overallScore
  );
  const averageScore =
    ideasWithScores.length > 0
      ? Math.round(
          ideasWithScores.reduce(
            (sum, i) => sum + (i.scores[0]?.overallScore || 0),
            0
          ) / ideasWithScores.length
        )
      : 0;

  return NextResponse.json({
    totalIdeas,
    researchedIdeas,
    averageScore,
    recentIdeas,
    topIdeas: sortedTopIdeas,
    usage,
  });
}
