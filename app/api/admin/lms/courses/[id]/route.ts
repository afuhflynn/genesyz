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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, admin.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              quiz: true,
              assignment: true,
            },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: course });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, admin.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id } = await params;
  const body = await request.json();

  const course = await db.course.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),

      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(body.position !== undefined && { position: body.position }),
    },
  });

  return NextResponse.json({ data: course });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, admin.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id } = await params;
  await db.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
