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

  const { id: moduleId } = await params;
  const body = await request.json();

  const last = await db.lesson.findFirst({
    where: { moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const lesson = await db.lesson.create({
    data: {
      moduleId,
      title: body.title?.trim() || "New Lesson",
      type: body.type || "TEXT",
      videoUrl: body.videoUrl || null,
      content: body.content || null,
      duration: body.duration || null,
      position: (last?.position ?? -1) + 1,
    },
  });

  if (body.type === "QUIZ") {
    await db.quiz.create({
      data: {
        lessonId: lesson.id,
        questions: body.questions ?? [],
        passingScore: body.passingScore ?? 80,
        maxAttempts: body.maxAttempts ?? 0,
      },
    });
  }

  if (body.type === "ASSIGNMENT") {
    await db.assignment.create({
      data: {
        lessonId: lesson.id,
        instructions: body.instructions ?? null,
        submissionType: body.submissionType ?? "TEXT",
        dueDays: body.dueDays ?? null,
      },
    });
  }

  return NextResponse.json({ data: lesson }, { status: 201 });
}
