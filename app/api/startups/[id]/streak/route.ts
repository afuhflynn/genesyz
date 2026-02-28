import {
  addWeeks,
  differenceInWeeks,
  isAfter,
  isBefore,
  startOfWeek,
} from "date-fns";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const streak = await db.startupStreak.findUnique({
    where: { startupId: startup.id },
  });

  // Get recent updates for context
  const recentUpdates = await db.weeklyUpdate.findMany({
    where: { startupId: startup.id },
    orderBy: { weekStart: "desc" },
    take: 12,
  });

  // Calculate if current streak is at risk
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const isAtRisk =
    streak && streak.lastUpdateWeek
      ? isBefore(
          startOfWeek(streak.lastUpdateWeek, { weekStartsOn: 1 }),
          currentWeekStart,
        )
      : false;

  // Determine next milestone
  const nextMilestone = streak
    ? Math.ceil((streak.currentStreak + 1) / 4) * 4
    : 4;
  const weeksToMilestone = nextMilestone - (streak?.currentStreak || 0);

  return NextResponse.json({
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    lastUpdateWeek: streak?.lastUpdateWeek,
    streakStartDate: streak?.streakStartDate,
    isAtRisk,
    nextMilestone,
    weeksToMilestone,
    recentWeeks: recentUpdates.map((u) => ({
      weekNumber: u.weekNumber,
      weekStart: u.weekStart,
    })),
  });
}

// POST - Record an update and update streak (idempotent)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;
  const body = await request.json();
  const { weekNumber, weekStart } = body;

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ id: startupIdOrSlug }, { slug: startupIdOrSlug }],
      userId: session.user.id,
    },
  });

  if (!startup) {
    return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  }

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  // Get or create streak
  let streak = await db.startupStreak.findUnique({
    where: { startupId: startup.id },
  });

  // Get the latest weekly update for this startup to verify new progress
  const latestUpdate = await db.weeklyUpdate.findFirst({
    where: { startupId: startup.id },
    orderBy: { weekStart: "desc" },
  });

  // Idempotency check: If we already have an update for this week or later, don't increment
  if (latestUpdate) {
    const latestWeekStart = startOfWeek(latestUpdate.weekStart, {
      weekStartsOn: 1,
    });
    const submittedWeekStart = weekStart
      ? startOfWeek(new Date(weekStart), { weekStartsOn: 1 })
      : null;

    // If the submitted week is not newer than what we already have, skip increment
    if (submittedWeekStart && !isAfter(submittedWeekStart, latestWeekStart)) {
      // Return current streak without incrementing
      const milestones = [4, 8, 12, 16, 20, 24, 52];
      const achievedMilestones = milestones.filter(
        (m) => (streak?.currentStreak || 0) >= m,
      );
      const nextMilestone =
        milestones.find((m) => m > (streak?.currentStreak || 0)) || 52;
      const weeksToMilestone = nextMilestone - (streak?.currentStreak || 0);

      return NextResponse.json({
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        lastUpdateWeek: streak?.lastUpdateWeek,
        streakStartDate: streak?.streakStartDate,
        achievedMilestones,
        nextMilestone,
        weeksToMilestone,
        isNewMilestone: false,
        idempotent: true,
        message: "Streak already counted for this week",
      });
    }
  }

  if (!streak) {
    // First streak ever
    streak = await db.startupStreak.create({
      data: {
        startupId: startup.id,
        currentStreak: 1,
        longestStreak: 1,
        lastUpdateWeek: now,
        streakStartDate: now,
      },
    });
  } else {
    const lastWeekStart = streak.lastUpdateWeek
      ? startOfWeek(streak.lastUpdateWeek, { weekStartsOn: 1 })
      : null;

    if (lastWeekStart) {
      const weeksDiff = differenceInWeeks(currentWeekStart, lastWeekStart);

      if (weeksDiff <= 1) {
        // Consecutive week - increase streak
        const newStreak = streak.currentStreak + 1;
        const newLongest = Math.max(streak.longestStreak, newStreak);

        streak = await db.startupStreak.update({
          where: { startupId: startup.id },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastUpdateWeek: now,
          },
        });
      } else {
        // Missed week(s) - streak broken, start fresh
        streak = await db.startupStreak.update({
          where: { startupId: startup.id },
          data: {
            currentStreak: 1,
            lastUpdateWeek: now,
            streakStartDate: now,
          },
        });
      }
    } else {
      // No previous update - first update
      streak = await db.startupStreak.update({
        where: { startupId: startup.id },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, streak.longestStreak),
          lastUpdateWeek: now,
          streakStartDate: now,
        },
      });
    }
  }

  // Determine milestone achievements
  const milestones = [4, 8, 12, 16, 20, 24, 52];
  const achievedMilestones = milestones.filter(
    (m) => streak.currentStreak >= m,
  );
  const nextMilestone = milestones.find((m) => m > streak.currentStreak) || 52;
  const weeksToMilestone = nextMilestone - streak.currentStreak;

  return NextResponse.json({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastUpdateWeek: streak.lastUpdateWeek,
    streakStartDate: streak.streakStartDate,
    achievedMilestones,
    nextMilestone,
    weeksToMilestone,
    isNewMilestone: achievedMilestones.includes(streak.currentStreak),
  });
}
