"use client";

import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Users,
  Award,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLmsAnalytics } from "@/hooks";
import { formatRelativeTime } from "@/lib/utils";

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
      </div>
    </div>
  );
}

export default function AdminLmsAnalyticsPage() {
  const { data, isLoading, error } = useLmsAnalytics();

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const analytics = (data as any)?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LMS Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Course performance and engagement metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalCourses ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalEnrollments ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.completionRate ?? 0}%
            </div>
            <Progress
              value={analytics?.completionRate ?? 0}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.completedEnrollments ?? 0} completed out of{" "}
              {analytics?.totalEnrollments ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificates Issued
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalCertificates ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Pass Rate</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.passRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.passedAttempts ?? 0} passed out of{" "}
              {analytics?.totalQuizAttempts ?? 0} attempts on{" "}
              {analytics?.totalQuizzes ?? 0} quizzes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.completedEnrollments ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Per-Course Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(analytics?.courseStats ?? []).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No course data yet.
              </p>
            ) : (
              (analytics?.courseStats ?? []).map(
                (course: any) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{course.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {course.totalEnrollments} enrolled
                      </span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{course.totalLessons} lessons</span>
                      <span>
                        {course.completed} completed ({course.completionRate}%)
                      </span>
                      <span>{course.inProgress} in progress</span>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(analytics?.recentEnrollments ?? []).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No enrollments yet.
              </p>
            ) : (
              (analytics?.recentEnrollments ?? []).map(
                (enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {enrollment.user?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {enrollment.course?.title ?? "Unknown course"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(enrollment.enrolledAt)}
                    </span>
                  </div>
                ),
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
