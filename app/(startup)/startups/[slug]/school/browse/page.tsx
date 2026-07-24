"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourses } from "@/hooks/use-school";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StartupBrowsePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useCourses(slug);
  if (isLoading)
    return (
      <div className="h-64 animate-pulse rounded-2xl border bg-muted/30" />
    );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Startup School</h1>
        <p className="text-muted-foreground">
          Learn directly inside this startup workspace.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(data?.data ?? []).map((course) => (
          <Link
            key={course.id}
            href={`/startups/${slug}/school/${course.slug}`}
          >
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {course.totalLessons} lessons
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
