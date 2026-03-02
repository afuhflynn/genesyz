import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const skip = (page - 1) * limit;

  const where: any = {
    userId: session.user.id,
    status: { not: "PENDING" },
    isArchived: false,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  if (dateFrom) {
    where.researchedAt = { ...where.researchedAt, gte: new Date(dateFrom) };
  }

  if (dateTo) {
    where.researchedAt = { ...where.researchedAt, lte: new Date(dateTo) };
  }

  const [ideas, total] = await Promise.all([
    db.idea.findMany({
      where,
      orderBy: { researchedAt: "desc" },
      skip,
      take: limit,
    }),
    db.idea.count({ where }),
  ]);

  // Get scores for each idea
  const ideasWithScores = await Promise.all(
    ideas.map(async (idea) => {
      const scores = await db.ideaScore.findMany({
        where: { ideaId: idea.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      return {
        id: idea.id,
        title: idea.title,
        summary: idea.summary,
        status: idea.status,
        researchedAt: idea.researchedAt,
        createdAt: idea.createdAt,
        score: scores[0]?.overallScore || null,
      };
    }),
  );

  let filteredIdeas = ideasWithScores;
  if (minScore) {
    filteredIdeas = ideasWithScores.filter(
      (idea) => idea.score && idea.score >= parseInt(minScore),
    );
  }

  return NextResponse.json({
    data: filteredIdeas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
