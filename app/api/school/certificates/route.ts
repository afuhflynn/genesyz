import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";
import { nanoid } from "nanoid";

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
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug and startup access are required" },
        { status: 403 },
      );
    const certificates = await db.certificate.findMany({
      where: { userId: session.user.id, startupId: startup.startupId },
      include: {
        course: { select: { title: true, slug: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ data: certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
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

    const decision = await checkRateLimit(
      request,
      session.user.id,
      ajRateLimit,
    );
    if (decision) return rateLimitResponse(decision);

    const { courseId, startupSlug } = await request.json();
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
        course: {
          include: {
            modules: {
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
        progress: {
          where: { status: "COMPLETED" },
          select: { lessonId: true },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 404 },
      );
    }

    const totalLessons = enrollment.course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0,
    );
    const completedLessons = enrollment.progress.length;

    if (completedLessons < totalLessons) {
      return NextResponse.json(
        { error: "Complete all lessons before claiming certificate" },
        { status: 400 },
      );
    }

    const existing = await db.certificate.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ data: existing });
    }

    const verificationCode = nanoid(12);

    const certificate = await db.certificate.create({
      data: {
        userId: session.user.id,
        startupId: startup.startupId,
        courseId,
        verificationCode,
        status: "ACTIVE",
      },
      include: {
        course: { select: { title: true, slug: true } },
      },
    });

    return NextResponse.json({ data: certificate }, { status: 201 });
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 },
    );
  }
}
