import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coursesCatalog } from "@/lib/school-catalog";
import { checkStartupAccess } from "@/lib/startup-permissions";

const catalogLectureIds = new Set(
  coursesCatalog.flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lectures.map((lecture) => lecture.id),
    ),
  ),
);

/**
 * GET /api/startups/[id]/school
 * Retrieve all completed lectures for this startup
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const decision = await checkRateLimit(req, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const progress = await db.lectureProgress.findMany({
      where: {
        startupId: access.startupId,
        completed: true,
      },
      select: {
        lectureId: true,
        completed: true,
        completedAt: true,
      },
    });

    return NextResponse.json({ data: progress });
  } catch (error) {
    console.error("[STARTUP_SCHOOL_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/startups/[id]/school
 * Mark a lecture as completed or incomplete
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "view_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const decision = await checkRateLimit(req, session.user.id, ajRateLimit);
    if (decision) return rateLimitResponse(decision);

    const { lectureId, completed = true } = await req.json();

    if (!lectureId) {
      return NextResponse.json({ error: "Missing lectureId" }, { status: 400 });
    }

    if (!catalogLectureIds.has(lectureId)) {
      return NextResponse.json(
        { error: "Lecture not found in the startup curriculum" },
        { status: 404 },
      );
    }

    if (completed) {
      const progress = await db.lectureProgress.upsert({
        where: {
          startupId_lectureId: {
            startupId: access.startupId,
            lectureId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          startupId: access.startupId,
          lectureId,
          completed: true,
        },
      });
      return NextResponse.json({ data: progress });
    } else {
      const progress = await db.lectureProgress.updateMany({
        where: {
          startupId: access.startupId,
          lectureId,
        },
        data: {
          completed: false,
        },
      });
      return NextResponse.json({ data: { lectureId, completed: false } });
    }
  } catch (error) {
    console.error("[STARTUP_SCHOOL_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
