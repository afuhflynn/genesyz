import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { createWeeklyUpdateSchema } from "@/lib/validators/startup";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const startup = await db.startup.findFirst({
    where: { OR: [{ id }, { slug: id }], userId: session.user.id },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const [updates, total] = await Promise.all([
    db.weeklyUpdate.findMany({
      where: { startupId: startup.id },
      include: { goals: { orderBy: { priority: "asc" } } },
      orderBy: { weekStart: "desc" },
      skip,
      take: limit,
    }),
    db.weeklyUpdate.count({ where: { startupId: startup.id } }),
  ]);

  return NextResponse.json({
    data: updates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = createWeeklyUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const startup = await db.startup.findFirst({
    where: { OR: [{ id }, { slug: id }], userId: session.user.id },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const existingUpdate = await db.weeklyUpdate.findUnique({
    where: {
      startupId_weekNumber: {
        startupId: startup.id,
        weekNumber: startup.currentWeekNumber,
      },
    },
  });

  if (existingUpdate) {
    return NextResponse.json(
      { error: "Weekly update already exists for this week" },
      { status: 400 },
    );
  }

  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);

  let previousMetricValue: number | null = null;
  const lastUpdate = await db.weeklyUpdate.findFirst({
    where: { startupId: startup.id },
    orderBy: { weekStart: "desc" },
  });

  if (lastUpdate) {
    previousMetricValue = lastUpdate.primaryMetricValue;
  }

  const metricDelta =
    previousMetricValue !== null
      ? parsed.data.primaryMetricValue - previousMetricValue
      : null;

  const update = await db.weeklyUpdate.create({
    data: {
      startupId: startup.id,
      weekNumber: startup.currentWeekNumber,
      weekStart,
      weekEnd,
      isLaunched: parsed.data.isLaunched,
      weeksToLaunch: parsed.data.weeksToLaunch,
      usersTalkedTo: parsed.data.usersTalkedTo,
      userLearnings: parsed.data.userLearnings,
      primaryMetricType: parsed.data.primaryMetricType,
      primaryMetricValue: parsed.data.primaryMetricValue,
      primaryMetricDelta: metricDelta,
      metricPeriod: parsed.data.metricPeriod,
      metricFormat: parsed.data.metricFormat,
      customMetricName: parsed.data.customMetricName,
      additionalMetrics: parsed.data.additionalMetrics ?? undefined,
      previousGoalsReview: parsed.data.previousGoalsReview ?? undefined,
      goalsCompletionRate: parsed.data.goalsCompletionRate,
      moraleScore: parsed.data.moraleScore,
      topImprovements: parsed.data.topImprovements,
      biggestObstacle: parsed.data.biggestObstacle,
      goals: {
        create: parsed.data.goals.map((goal) => ({
          content: goal.content,
          priority: goal.priority,
          completed: goal.completed ?? false,
        })),
      },
    },
    include: { goals: true },
  });

  await db.startup.update({
    where: { id: startup.id },
    data: {
      currentWeekNumber: { increment: 1 },
      lastUpdateAt: now,
      isLaunched: parsed.data.isLaunched,
      primaryMetricType: parsed.data.primaryMetricType,
      primaryMetricValue: parsed.data.primaryMetricValue,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "weekly_update.created",
      resource: "weekly_update",
      resourceId: update.id,
      metadata: { startupId: startup.id, weekNumber: update.weekNumber },
    },
  });

  await inngest.send({
    name: "weeklyUpdate.created",
    data: {
      updateId: update.id,
      startupId: startup.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ...update, needsAnalysis: true }, { status: 201 });
}
