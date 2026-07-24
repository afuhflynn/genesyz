"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/school/video-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCourse, useUpdateProgress } from "@/hooks/use-school";
import { extractYouTubeVideoId } from "@/lib/school/youtube";

export default function StartupLessonPage() {
  const { slug, courseSlug, lessonId } = useParams<{
    slug: string;
    courseSlug: string;
    lessonId: string;
  }>();
  const { data, isLoading } = useCourse(courseSlug, slug);
  const update = useUpdateProgress(slug);
  const course = data?.data;
  const lesson = course?.modules
    .flatMap((module) => module.lessons)
    .find((item) => item.id === lessonId);
  const base = `/startups/${slug}/school`;
  const complete = () =>
    update.mutate(
      { lessonId, percent: 100 },
      {
        onSuccess: () => toast.success("Lesson completed"),
        onError: () => toast.error("Could not save progress"),
      },
    );
  if (isLoading)
    return (
      <div className="h-64 animate-pulse rounded-2xl border bg-muted/30" />
    );
  if (!course || !lesson)
    return <p className="text-destructive">Lesson not found</p>;
  const videoId = lesson.videoUrl
    ? extractYouTubeVideoId(lesson.videoUrl)
    : null;
  const isCompleted = course.completedLessonIds.includes(lesson.id);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href={`${base}/${course.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to course
      </Link>
      <div>
        <p className="text-sm text-muted-foreground">{course.title}</p>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </div>
      {videoId && <VideoPlayer videoId={videoId} onComplete={complete} />}
      {lesson.type === "TEXT" && (
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap p-6">
            {lesson.content ??
              "Read this lesson, then mark it complete when you are ready."}
          </CardContent>
        </Card>
      )}
      {!isCompleted && (
        <Button onClick={complete} disabled={update.isPending}>
          Mark lesson complete
        </Button>
      )}
      {isCompleted && (
        <p className="text-sm text-emerald-600">✓ Lesson completed</p>
      )}
    </div>
  );
}
