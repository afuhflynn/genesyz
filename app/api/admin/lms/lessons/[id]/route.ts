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

  if (body.type !== undefined && !["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"].includes(body.type)) {
    return NextResponse.json({ error: "Invalid lesson type" }, { status: 400 });
  }

  if (body.type === "QUIZ" && body.quiz) {
    const questions = body.quiz.questions;
    const validQuestions = Array.isArray(questions) && questions.length > 0 && questions.every((item) => {
      if (!item || typeof item.question !== "string" || !item.question.trim()) return false;
      if (!Array.isArray(item.options) || item.options.length < 2 || item.options.some((option: unknown) => typeof option !== "string" || !option.trim())) return false;
      return Number.isInteger(item.correctAnswer) && item.correctAnswer >= 0 && item.correctAnswer < item.options.length;
    });
    if (!validQuestions || !Number.isInteger(body.quiz.passingScore) || body.quiz.passingScore < 0 || body.quiz.passingScore > 100 || !Number.isInteger(body.quiz.maxAttempts) || body.quiz.maxAttempts < 1) {
      return NextResponse.json({ error: "Invalid quiz configuration" }, { status: 400 });
    }
  }

  const lesson = await db.lesson.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.position !== undefined && { position: body.position }),
    },
  });

  if (body.type === "QUIZ" && body.quiz) {
    await db.quiz.upsert({
      where: { lessonId: id },
      create: { lessonId: id, ...body.quiz },
      update: body.quiz,
    });
  }

  if (body.type === "ASSIGNMENT" && body.assignment) {
    await db.assignment.upsert({
      where: { lessonId: id },
      create: { lessonId: id, ...body.assignment },
      update: body.assignment,
    });
  }

  return NextResponse.json({ data: lesson });
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
  await db.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
