import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    let streak = await db.streak.findUnique({
      where: { userId: session.user.id },
    });

    if (!streak) {
      streak = await db.streak.create({
        data: { userId: session.user.id },
      });
    }

    const activity = await db.learningActivity.findMany({ where: { userId: session.user.id, activityDate: { gte: new Date(Date.now() - 90 * 86400000) } }, select: { activityDate: true, activityType: true }, orderBy: { activityDate: "desc" } });
    return NextResponse.json({
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate.toISOString(),
        activity,
      },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    let streak = await db.streak.findUnique({
      where: { userId: session.user.id },
    });

    if (!streak) {
      streak = await db.streak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        },
      });

      return NextResponse.json({
        data: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastActiveDate: streak.lastActiveDate.toISOString(),
          updated: true,
        },
      });
    }

    const lastActive = new Date(
      Date.UTC(
        streak.lastActiveDate.getUTCFullYear(),
        streak.lastActiveDate.getUTCMonth(),
        streak.lastActiveDate.getUTCDate(),
      ),
    );

    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return NextResponse.json({
        data: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastActiveDate: streak.lastActiveDate.toISOString(),
          updated: false,
        },
      });
    }

    let newCurrent = streak.currentStreak;
    if (diffDays === 1) {
      newCurrent += 1;
    } else {
      newCurrent = 1;
    }

    const newLongest = Math.max(newCurrent, streak.longestStreak);

    await db.streak.update({
      where: { userId: session.user.id },
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today,
      },
    });

    return NextResponse.json({
      data: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today.toISOString(),
        updated: true,
      },
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { error: "Failed to update streak" },
      { status: 500 },
    );
  }
}
