import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { checkStartupAccess } from "@/lib/startup-permissions";
import {
  getWeekEndForDate,
  getWeekStartForDate,
  getWeeksSinceCreation,
} from "@/lib/utils/date";
import { createWeeklyUpdateSchema } from "@/lib/validators/startup";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const access = await checkStartupAccess(id, "view_startup");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const { searchParams } = new URL(_request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
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

  const access = await checkStartupAccess(id, "submit_weekly_update");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const now = new Date();
  const weekNumber = getWeeksSinceCreation(startup.createdAt);
  const weekStart = getWeekStartForDate(now);
  const weekEnd = getWeekEndForDate(now);

  const existingUpdate = await db.weeklyUpdate.findUnique({
    where: {
      startupId_weekNumber: {
        startupId: startup.id,
        weekNumber,
      },
    },
  });

  if (existingUpdate) {
    return NextResponse.json(
      { error: "Weekly update already exists for this week" },
      { status: 400 },
    );
  }

  const existingByDateRange = await db.weeklyUpdate.findFirst({
    where: {
      startupId: startup.id,
      weekStart: { lte: now },
      weekEnd: { gte: now },
    },
  });

  if (existingByDateRange) {
    return NextResponse.json(
      { error: "A weekly update already exists within this calendar week" },
      { status: 400 },
    );
  }

  let previousMetricValue: number | null = null;
  const lastUpdate = await db.weeklyUpdate.findFirst({
    where: { startupId: startup.id },
    orderBy: { weekStart: "desc" },
  });

  if (lastUpdate) {
    previousMetricValue = lastUpdate.primaryMetricValue;
  }

  // Fetch latest update BEFORE creating new one (for streak logic)
  const latestUpdate = await db.weeklyUpdate.findFirst({
    where: { startupId: startup.id },
    orderBy: { weekStart: "desc" },
  });

  const metricDelta =
    previousMetricValue !== null
      ? parsed.data.primaryMetricValue - previousMetricValue
      : null;

  // Calculate editable window (3 days from creation)
  const editableUntil = new Date();
  editableUntil.setDate(editableUntil.getDate() + 3);

  const update = await db.weeklyUpdate.create({
    data: {
      startupId: startup.id,
      weekNumber,
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
      editableUntil,
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
      currentWeekNumber: weekNumber + 1,
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

  // Update streak directly via DB (avoiding auth issues with fetch)
  try {
    const now = new Date();

    // Get current streak
    const streak = await db.startupStreak.findUnique({
      where: { startupId: startup.id },
    });

    // Use the latestUpdate fetched BEFORE create (for proper idempotency)
    // If no previous update exists, this is the first streak
    if (!latestUpdate) {
      // First streak ever
      await db.startupStreak.create({
        data: {
          startupId: startup.id,
          currentStreak: 1,
          longestStreak: 1,
          lastUpdateWeek: now,
          streakStartDate: now,
        },
      });
    } else if (!streak) {
      // Streak record doesn't exist but updates do - create it
      await db.startupStreak.create({
        data: {
          startupId: startup.id,
          currentStreak: 1,
          longestStreak: 1,
          lastUpdateWeek: now,
          streakStartDate: now,
        },
      });
    } else {
      // Check if this is a consecutive week based on startup creation date
      const submittedWeekNumber = getWeeksSinceCreation(startup.createdAt);
      const lastWeekNumber = latestUpdate.weekNumber;

      if (submittedWeekNumber === lastWeekNumber + 1) {
        // Consecutive week - increment streak
        const newStreak = streak.currentStreak + 1;
        await db.startupStreak.update({
          where: { startupId: startup.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(streak.longestStreak, newStreak),
            lastUpdateWeek: now,
          },
        });
      } else if (submittedWeekNumber > lastWeekNumber + 1) {
        // Missed week(s) - streak broken, start fresh
        await db.startupStreak.update({
          where: { startupId: startup.id },
          data: {
            currentStreak: 1,
            lastUpdateWeek: now,
            streakStartDate: now,
          },
        });
      }
      // If submittedWeekNumber <= lastWeekNumber, it's a duplicate - skip streak update
    }
  } catch (streakError) {
    console.error("Failed to update streak:", streakError);
  }

  await inngest.send({
    name: "weeklyUpdate.created",
    data: {
      updateId: update.id,
      startupId: startup.id,
      userId: session.user.id,
    },
  });

  await inngest.send({
    name: "startup.weeklyUpdate.followerNotification",
    data: {
      updateId: update.id,
      startupId: startup.id,
    },
  });

  return NextResponse.json({ ...update, needsAnalysis: true }, { status: 201 });
}

// PATCH - Edit weekly update (only within editable window)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const body = await request.json();
  const { updateId, ...updateData } = body;

  if (!updateId) {
    return NextResponse.json(
      { error: "Update ID is required" },
      { status: 400 },
    );
  }

  const access = await checkStartupAccess(
    startupIdOrSlug,
    "submit_weekly_update",
  );

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const existingUpdate = await db.weeklyUpdate.findFirst({
    where: {
      id: updateId,
      startupId: startup.id,
    },
  });

  if (!existingUpdate) {
    return NextResponse.json({ error: "Update not found" }, { status: 404 });
  }

  // Check if still editable
  const now = new Date();
  const canEdit =
    existingUpdate.editableUntil &&
    new Date(existingUpdate.editableUntil) > now;
  const isLocked = existingUpdate.isLocked;

  if (isLocked || !canEdit) {
    return NextResponse.json(
      {
        error: "Update is no longer editable",
        editableUntil: existingUpdate.editableUntil,
        isLocked: existingUpdate.isLocked,
      },
      { status: 403 },
    );
  }

  // Calculate new metric delta if metric value changed
  let metricDelta = existingUpdate.primaryMetricDelta;
  if (
    updateData.primaryMetricValue !== undefined &&
    updateData.primaryMetricValue !== existingUpdate.primaryMetricValue
  ) {
    const lastUpdate = await db.weeklyUpdate.findFirst({
      where: {
        startupId: startup.id,
        weekStart: { lt: existingUpdate.weekStart },
      },
      orderBy: { weekStart: "desc" },
    });

    if (lastUpdate) {
      metricDelta =
        updateData.primaryMetricValue - lastUpdate.primaryMetricValue;
    }
  }

  const updated = await db.weeklyUpdate.update({
    where: { id: updateId },
    data: {
      ...(updateData.primaryMetricValue !== undefined && {
        primaryMetricValue: updateData.primaryMetricValue,
        primaryMetricDelta: metricDelta,
      }),
      ...(updateData.usersTalkedTo !== undefined && {
        usersTalkedTo: updateData.usersTalkedTo,
      }),
      ...(updateData.userLearnings !== undefined && {
        userLearnings: updateData.userLearnings,
      }),
      ...(updateData.moraleScore !== undefined && {
        moraleScore: updateData.moraleScore,
      }),
      ...(updateData.topImprovements !== undefined && {
        topImprovements: updateData.topImprovements,
      }),
      ...(updateData.biggestObstacle !== undefined && {
        biggestObstacle: updateData.biggestObstacle,
      }),
      ...(updateData.additionalMetrics !== undefined && {
        additionalMetrics: updateData.additionalMetrics,
      }),
      ...(updateData.goals !== undefined && {
        goals: {
          deleteMany: { weeklyUpdateId: updateId },
          create: updateData.goals.map(
            (goal: {
              content: string;
              priority: number;
              completed?: boolean;
            }) => ({
              content: goal.content,
              priority: goal.priority,
              completed: goal.completed ?? false,
            }),
          ),
        },
      }),
    },
    include: { goals: true },
  });

  return NextResponse.json(updated);
}
