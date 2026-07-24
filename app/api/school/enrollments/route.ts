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
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug is required" },
        { status: 400 },
      );
    const enrollments = await db.enrollment.findMany({
      where: { userId: session.user.id, startupId: startup.startupId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            description: true,
            modules: {
              select: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
        progress: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const data = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0,
      );
      return {
        ...enrollment,
        totalLessons,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          slug: enrollment.course.slug,
          thumbnail: enrollment.course.thumbnail,
          description: enrollment.course.description,
        },
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}
