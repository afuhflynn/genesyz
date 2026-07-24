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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await checkAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decision = await checkRateLimit(request, admin.id, ajRateLimit);
  if (decision) return rateLimitResponse(decision);

  const { id: courseId } = await params;
  const { title } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const last = await db.module.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const module = await db.module.create({
    data: {
      courseId,
      title: title.trim(),
      position: (last?.position ?? -1) + 1,
    },
  });

  return NextResponse.json({ data: module }, { status: 201 });
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

  const { id: courseId } = await params;
  const { modules } = await request.json();

  if (!Array.isArray(modules)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.$transaction(
    modules.map((m: { id: string; position: number }) =>
      db.module.updateMany({
        where: { id: m.id, courseId },
        data: { position: m.position },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
