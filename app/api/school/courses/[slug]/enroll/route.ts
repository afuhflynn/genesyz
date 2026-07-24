import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";

export async function POST(
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
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existing = await db.enrollment.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { data: existing, message: "Already enrolled" },
        { status: 200 },
      );
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: session.user.id,
        startupId: startup.startupId,
        courseId: course.id,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ data: enrollment }, { status: 201 });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
