import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordLearningActivity } from "@/lib/school/activity";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id: assignmentId } = await params;
    const { content, startupSlug } = await request.json();
    const startup = startupSlug
      ? await getStartupSchoolAccess(startupSlug)
      : null;
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug and startup access are required" },
        { status: 403 },
      );

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        lesson: {
          include: {
            module: { select: { courseId: true } },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 },
      );
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId: assignment.lesson.module.courseId,
        },
      },
    });
    if (!enrollment)
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 },
      );

    const existing = await db.submission.findUnique({
      where: {
        assignmentId_userId: { assignmentId, userId: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already submitted. One submission per assignment." },
        { status: 400 },
      );
    }

    const submission = await db.submission.create({
      data: {
        assignmentId,
        userId: session.user.id,
        content,
      },
    });
    await recordLearningActivity(
      session.user.id,
      "ASSIGNMENT_SUBMITTED",
      assignmentId,
    );
    await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId: assignment.lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId: assignment.lessonId,
        maxPercentage: 100,
        status: "COMPLETED",
        completedAt: new Date(),
      },
      update: {
        maxPercentage: 100,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
    const [totalLessons, completedLessons] = await Promise.all([
      db.lesson.count({
        where: { module: { courseId: assignment.lesson.module.courseId } },
      }),
      db.lessonProgress.count({
        where: { enrollmentId: enrollment.id, status: "COMPLETED" },
      }),
    ]);
    await db.enrollment.update({
      where: { id: enrollment.id },
      data:
        completedLessons >= totalLessons
          ? { status: "COMPLETED", completedAt: new Date() }
          : { status: "IN_PROGRESS" },
    });

    return NextResponse.json({ data: submission }, { status: 201 });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 },
    );
  }
}
