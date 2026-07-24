import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
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

    const { slug } = await params;
    const startupSlug = new URL(request.url).searchParams.get("startupSlug");
    const startup = startupSlug
      ? await getStartupSchoolAccess(startupSlug)
      : null;
    if (startupSlug && !startup)
      return NextResponse.json(
        { error: "Startup access denied" },
        { status: 403 },
      );
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug is required" },
        { status: 400 },
      );

    const course = await db.course.findUnique({
      where: { slug, isPublished: true },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              include: {
                quiz: {
                  select: {
                    id: true,
                    passingScore: true,
                    maxAttempts: true,
                    questions: true,
                  },
                },
                assignment: {
                  select: { id: true, submissionType: true, dueDays: true },
                },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId: course.id,
        },
      },
      include: {
        progress: true,
      },
    });

    const completedLessonIds = new Set(
      enrollment?.progress
        .filter((p) => p.status === "COMPLETED")
        .map((p) => p.lessonId) ?? [],
    );

    const totalLessons = course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0,
    );

    const learnerCourse = {
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          quiz: lesson.quiz
            ? {
                id: lesson.quiz.id,
                passingScore: lesson.quiz.passingScore,
                maxAttempts: lesson.quiz.maxAttempts,
                questions: (
                  lesson.quiz.questions as Array<{
                    question: string;
                    options: string[];
                    explanation?: string;
                  }>
                ).map(({ question, options, explanation }) => ({
                  question,
                  options,
                  ...(explanation ? { explanation } : {}),
                })),
              }
            : null,
        })),
      })),
    };

    return NextResponse.json({
      data: {
        ...learnerCourse,
        enrollment,
        completedLessonIds: [...completedLessonIds],
        completedLessons: completedLessonIds.size,
        totalLessons,
        startupId: startup?.startupId ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}
