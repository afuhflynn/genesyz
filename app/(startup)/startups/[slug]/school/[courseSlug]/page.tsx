"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourse, useEnroll } from "@/hooks/use-school";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StartupCoursePage() {
  const { slug, courseSlug } = useParams<{
    slug: string;
    courseSlug: string;
  }>();
  const { data, isLoading, error } = useCourse(courseSlug, slug);
  const enroll = useEnroll(slug);
  const course = data?.data;
  const base = `/startups/${slug}/school`;
  if (isLoading)
    return (
      <div className="h-64 animate-pulse rounded-2xl border bg-muted/30" />
    );
  if (error || !course)
    return (
      <p className="text-destructive">{error?.message ?? "Course not found"}</p>
    );
  const percent = course.totalLessons
    ? Math.round((course.completedLessons / course.totalLessons) * 100)
    : 0;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`${base}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Startup School
      </Link>
      <section className="rounded-2xl border bg-gradient-to-br from-orange-50 via-background to-amber-50 p-6 dark:from-orange-950/20">
        <Badge variant="outline">{course.totalLessons} lessons</Badge>
        <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 text-muted-foreground">{course.description}</p>
        {course.enrollment ? (
          <div className="mt-5 flex items-center gap-4">
            <Progress value={percent} className="max-w-sm" />
            <span className="text-sm">{percent}% complete</span>
          </div>
        ) : (
          <Button
            className="mt-5"
            onClick={() => enroll.mutate(course.slug)}
            disabled={enroll.isPending}
          >
            Enroll in this course
          </Button>
        )}
      </section>
      <div className="space-y-4">
        {course.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {module.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`${base}/${course.slug}/lessons/${lesson.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <span>{lesson.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {course.completedLessonIds.includes(lesson.id)
                      ? "Completed"
                      : lesson.type.toLowerCase()}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
