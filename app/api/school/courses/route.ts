import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";

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

    const startupSlug = new URL(request.url).searchParams.get("startupSlug");
    const startup = startupSlug
      ? await getStartupSchoolAccess(startupSlug)
      : null;
    if (startupSlug && !startup)
      return NextResponse.json(
        { error: "Startup access denied" },
        { status: 403 },
      );
    const courses = await db.course.findMany({
      where: { isPublished: true },
      orderBy: { position: "asc" },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                position: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    const enrollments = await db.enrollment.findMany({
      where: {
        userId: session.user.id,
        ...(startup ? { startupId: startup.startupId } : {}),
      },
    });

    const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

    const data = courses.map((course) => {
      const enrollment = enrollmentMap.get(course.id);
      const totalLessons = course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0,
      );
      return {
        ...course,
        enrollment: enrollment || null,
        totalLessons,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
