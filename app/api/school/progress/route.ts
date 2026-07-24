import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordLearningActivity } from "@/lib/school/activity";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(
      request,
      session.user.id,
      ajRateLimit,
    );
    if (decision) return rateLimitResponse(decision);

    const { lessonId, percent, timeSpent, startupSlug } = await request.json();

    if (!lessonId || typeof percent !== "number") {
      return NextResponse.json(
        { error: "lessonId and percent are required" },
        { status: 400 },
      );
    }
    const startup = startupSlug
      ? await getStartupSchoolAccess(startupSlug)
      : null;
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug and startup access are required" },
        { status: 403 },
      );

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { select: { courseId: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 },
      );
    }

    const isCompleted = percent >= 80 || percent === 100;

    const existing = await db.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
    });

    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        maxPercentage: percent,
        status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
        timeSpent: timeSpent || 0,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        maxPercentage:
          existing && percent > existing.maxPercentage ? percent : undefined,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        status: isCompleted ? "COMPLETED" : undefined,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    if (isCompleted) {
      await recordLearningActivity(
        session.user.id,
        "LESSON_COMPLETED",
        lessonId,
      );
      const [totalLessons, completedLessons] = await Promise.all([
        db.lesson.count({
          where: { module: { courseId: lesson.module.courseId } },
        }),
        db.lessonProgress.count({
          where: { enrollmentId: enrollment.id, status: "COMPLETED" },
        }),
      ]);
      if (totalLessons > 0 && completedLessons >= totalLessons) {
        await db.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      } else if (enrollment.status === "ENROLLED") {
        await db.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "IN_PROGRESS" },
        });
      }
    }

    return NextResponse.json({ data: progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await checkRateLimit(
      request,
      session.user.id,
      ajRateLimit,
    );
    if (decision) return rateLimitResponse(decision);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const startupSlug = searchParams.get("startupSlug");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    const startup = startupSlug
      ? await getStartupSchoolAccess(startupSlug)
      : null;
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug and startup access are required" },
        { status: 403 },
      );
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId,
        },
      },
      include: {
        progress: {
          include: {
            lesson: {
              select: { id: true, title: true, type: true, duration: true },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: enrollment });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}
