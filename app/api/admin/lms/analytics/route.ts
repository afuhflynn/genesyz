import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const [
    totalCourses,
    totalEnrollments,
    completedEnrollments,
    totalCertificates,
    totalQuizzes,
    totalQuizAttempts,
    passedAttempts,
    recentEnrollments,
  ] = await Promise.all([
    db.course.count({ where: { isPublished: true } }),
    db.enrollment.count(),
    db.enrollment.count({ where: { status: "COMPLETED" } }),
    db.certificate.count(),
    db.quiz.count(),
    db.quizAttempt.count(),
    db.quizAttempt.count({ where: { passed: true } }),
    db.enrollment.findMany({
      take: 10,
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  const perCourse = await db.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      _count: { select: { enrollments: true } },
      modules: {
        select: {
          lessons: { select: { id: true } },
        },
      },
    },
  });

  const courseStats = await Promise.all(
    perCourse.map(async (course) => {
      const totalLessons = course.modules.reduce(
        (s, m) => s + m.lessons.length,
        0,
      );
      const completed = await db.enrollment.count({
        where: { courseId: course.id, status: "COMPLETED" },
      });
      const inProgress = await db.enrollment.count({
        where: { courseId: course.id, status: "IN_PROGRESS" },
      });
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        totalEnrollments: course._count.enrollments,
        completed,
        inProgress,
        totalLessons,
        completionRate:
          course._count.enrollments > 0
            ? Math.round((completed / course._count.enrollments) * 100)
            : 0,
      };
    }),
  );

  const completionRate =
    totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

  const passRate =
    totalQuizAttempts > 0
      ? Math.round((passedAttempts / totalQuizAttempts) * 100)
      : 0;

  return NextResponse.json({
    data: {
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      totalCertificates,
      totalQuizzes,
      totalQuizAttempts,
      passRate,
      courseStats,
      recentEnrollments,
    },
  });
}
