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

    const [
      enrollments,
      completedLessons,
      certificates,
      badges,
      streakEntry,
    ] = await Promise.all([
      db.enrollment.count({
        where: { userId: session.user.id },
      }),
      db.lessonProgress.count({
        where: {
          enrollment: { userId: session.user.id },
          status: "COMPLETED",
        },
      }),
      db.certificate.count({
        where: { userId: session.user.id },
      }),
      db.userBadge.count({
        where: { userId: session.user.id },
      }),
      db.streak.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const streak = streakEntry?.currentStreak ?? 0;

    return NextResponse.json({
      data: {
        enrollments,
        completedLessons,
        certificates,
        badges,
        streak,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
