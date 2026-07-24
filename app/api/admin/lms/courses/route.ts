import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return null;
  return session.user;
}

export async function GET(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, admin.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
      modules: {
        include: { lessons: { select: { id: true } } },
      },
    },
  });

  const data = courses.map((c) => ({
    ...c,
    totalLessons: c.modules.reduce((s, m) => s + m.lessons.length, 0),
    totalEnrollments: c._count.enrollments,
  }));

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, admin.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const body = await request.json();
  const course = await db.course.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description || null,

      thumbnail: body.thumbnail || null,
      isPublished: body.isPublished ?? false,
      position:
        (await db.course.count()) + 1,
    },
  });

  return NextResponse.json({ data: course }, { status: 201 });
}
