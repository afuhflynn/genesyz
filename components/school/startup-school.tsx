"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourses, useEnrollments } from "@/hooks/use-school";

export function StartupSchool({ slug }: { slug: string }) {
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useEnrollments(slug);
  const { data: coursesData, isLoading: coursesLoading } = useCourses(slug);
  const base = `/startups/${slug}/school`;
  const enrollments = enrollmentsData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const next =
    enrollments.find((item) => item.status !== "COMPLETED") ?? enrollments[0];
  const completed = enrollments.reduce(
    (sum, item) => sum + (item.progress?.length ?? 0),
    0,
  );
  const total = enrollments.reduce((sum, item) => sum + item.totalLessons, 0);

  if (enrollmentsLoading || coursesLoading)
    return (
      <div className="h-64 animate-pulse rounded-2xl border bg-muted/30" />
    );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-orange-50 via-background to-amber-50 p-6 dark:from-orange-950/20 dark:to-amber-950/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
              <GraduationCap className="h-4 w-4" /> Startup School
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Learn, apply, and build momentum.
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Founder lessons live inside your startup workspace, with progress
              and certificates saved for this startup.
            </p>
          </div>
          <div className="min-w-56 rounded-xl border bg-background/80 p-4">
            <div className="mb-2 flex justify-between text-xs font-medium">
              <span>Your progress</span>
              <span>
                {completed}/{total}
              </span>
            </div>
            <Progress value={total ? (completed / total) * 100 : 0} />
          </div>
        </div>
        {next?.course && (
          <Button asChild className="mt-5">
            <Link href={`${base}/${next.course.slug}`}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Continue learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your learning path</h2>
            <p className="text-sm text-muted-foreground">
              Choose a course, then work through each lesson here.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`${base}/browse`}>Browse courses</Link>
          </Button>
        </div>
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                You have not enrolled in a course yet.
              </p>
              <Button asChild>
                <Link href={`${base}/browse`}>Explore the school</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments
              .filter((enrollment) => enrollment.course)
              .map((enrollment) => {
                const percent = enrollment.totalLessons
                  ? Math.round(
                      ((enrollment.progress?.length ?? 0) /
                        enrollment.totalLessons) *
                        100,
                    )
                  : 0;
                return (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-lg">
                          {enrollment.course?.title}
                        </CardTitle>
                        {enrollment.status === "COMPLETED" && (
                          <Badge variant="secondary">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Progress value={percent} />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{percent}% complete</span>
                        <Button asChild size="sm">
                          <Link href={`${base}/${enrollment.course?.slug}`}>
                            Open course
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </section>

      {courses.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {courses.length} published course{courses.length === 1 ? "" : "s"}{" "}
          available in Startup School.
        </p>
      )}
    </div>
  );
}
