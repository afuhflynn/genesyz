import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajRateLimit, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordLearningActivity } from "@/lib/school/activity";
import { getStartupSchoolAccess } from "@/lib/school/startup-context";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id: quizId } = await params;
    const { answers, startupSlug } = await request.json();
    const startup = startupSlug
      ? await getStartupSchoolAccess(startupSlug)
      : null;
    if (!startup)
      return NextResponse.json(
        { error: "startupSlug and startup access are required" },
        { status: 403 },
      );

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            module: { select: { courseId: true } },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = quiz.questions as Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;

    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_startupId_courseId: {
          userId: session.user.id,
          startupId: startup.startupId,
          courseId: quiz.lesson.module.courseId,
        },
      },
    });
    if (!enrollment)
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 },
      );
    const attempts = await db.quizAttempt.count({
      where: { quizId, userId: session.user.id },
    });
    if (attempts >= quiz.maxAttempts)
      return NextResponse.json(
        { error: "Maximum quiz attempts reached" },
        { status: 400 },
      );
    if (!Array.isArray(answers) || answers.length !== questions.length)
      return NextResponse.json(
        { error: "Answer every question before submitting" },
        { status: 400 },
      );

    let correctCount = 0;
    const gradedAnswers = (answers as number[]).map(
      (selected: number, i: number) => {
        const correct = selected === questions[i]?.correctAnswer;
        if (correct) correctCount++;
        return {
          questionIndex: i,
          selectedAnswer: selected,
          correctAnswer: questions[i]?.correctAnswer,
          correct,
        };
      },
    );

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score,
        answers: gradedAnswers,
        passed,
      },
    });

    await recordLearningActivity(
      session.user.id,
      passed ? "QUIZ_PASSED" : "QUIZ_SUBMITTED",
      quizId,
    );
    if (passed) {
      await db.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: quiz.lessonId,
          },
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId: quiz.lessonId,
          maxPercentage: 100,
          status: "COMPLETED",
          completedAt: new Date(),
        },
        update: {
          maxPercentage: 100,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      const [totalLessons, completedLessons] = await Promise.all([
        db.lesson.count({
          where: { module: { courseId: quiz.lesson.module.courseId } },
        }),
        db.lessonProgress.count({
          where: { enrollmentId: enrollment.id, status: "COMPLETED" },
        }),
      ]);
      await db.enrollment.update({
        where: { id: enrollment.id },
        data:
          completedLessons >= totalLessons
            ? { status: "COMPLETED", completedAt: new Date() }
            : { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      data: { ...attempt, totalQuestions: questions.length, correctCount },
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 },
    );
  }
}
