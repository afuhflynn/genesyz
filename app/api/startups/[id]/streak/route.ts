import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { getWeeksSinceCreation } from "@/lib/utils/date";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: startupIdOrSlug } = await params;

  const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

  if (!access.hasAccess || !access.startupId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
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
    take: 52,
  });

  // Auto-initialize streak if updates exist but no streak record
  let streakRecord = streak;
  if (!streak && recentUpdates.length > 0) {
    const sortedUpdates = [...recentUpdates].sort(
      (a, b) => b.weekNumber - a.weekNumber,
    );

    // Calculate current streak (consecutive weeks from most recent)
    let currentStreak = 1;
    for (let i = 0; i < sortedUpdates.length - 1; i++) {
      if (sortedUpdates[i].weekNumber - sortedUpdates[i + 1].weekNumber === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < sortedUpdates.length; i++) {
      if (sortedUpdates[i - 1].weekNumber - sortedUpdates[i].weekNumber === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Create streak record
    streakRecord = await db.startupStreak.create({
      data: {
        startupId: startup.id,
        currentStreak,
        longestStreak,
        lastUpdateWeek: sortedUpdates[0].weekStart,
        streakStartDate: sortedUpdates[sortedUpdates.length - 1].weekStart,
      },
    });
  }

  // Calculate if current streak is at risk based on startup creation date
  const currentWeekNumber = getWeeksSinceCreation(startup.createdAt);
  const lastUpdateWeekNumber = streakRecord?.lastUpdateWeek
    ? (() => {
        const diffInMs =
          new Date(streakRecord.lastUpdateWeek).getTime() -
          new Date(startup.createdAt).getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        return Math.floor(diffInDays / 7) + 1;
      })()
    : null;

  const isAtRisk =
    lastUpdateWeekNumber !== null
      ? currentWeekNumber - lastUpdateWeekNumber > 1
      : false;

  // Determine next milestone
  const nextMilestone = streakRecord
    ? Math.ceil((streakRecord.currentStreak + 1) / 4) * 4
    : 4;
  const weeksToMilestone = nextMilestone - (streakRecord?.currentStreak || 0);

  return NextResponse.json({
    currentStreak: streakRecord?.currentStreak || 0,
    longestStreak: streakRecord?.longestStreak || 0,
    lastUpdateWeek: streakRecord?.lastUpdateWeek,
    streakStartDate: streakRecord?.streakStartDate,
    isAtRisk,
    nextMilestone,
    weeksToMilestone,
    recentWeeks: recentUpdates.slice(0, 12).map((u) => ({
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
  const { weekNumber } = body;

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

  const now = new Date();

  // Get or create streak
  let streak = await db.startupStreak.findUnique({
    where: { startupId: startup.id },
  });

  // Get the latest weekly update for this startup to verify new progress
  const latestUpdate = await db.weeklyUpdate.findFirst({
    where: { startupId: startup.id },
    orderBy: { weekNumber: "desc" },
  });

  // Idempotency check: If we already have an update for this week or later, don't increment
  // Use weekNumber from weekly updates (which is based on startup creation date)
  if (latestUpdate && weekNumber) {
    // If the submitted week is not newer than what we already have, skip increment
    if (weekNumber <= latestUpdate.weekNumber) {
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
    // Use weekNumber from updates (based on startup creation date)
    const lastUpdateWeekNumber = latestUpdate?.weekNumber ?? 0;
    const submittedWeekNumber = weekNumber ?? lastUpdateWeekNumber + 1;

    if (submittedWeekNumber === lastUpdateWeekNumber + 1) {
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
    } else if (submittedWeekNumber > lastUpdateWeekNumber + 1) {
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
    // If submittedWeekNumber <= lastUpdateWeekNumber, it's a duplicate - skip
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
