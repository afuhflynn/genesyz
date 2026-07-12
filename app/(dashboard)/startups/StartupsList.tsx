"use client";

import {
  ArrowRight,
  Building2,
  Loader2,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfiniteScroll } from "@/components/ui/InfiniteScroll";
import { type StartupWithDetails, useInfiniteStartups } from "@/hooks";
import { getWeeksSinceCreation } from "@/lib/utils/date";

const STAGE_COLORS: Record<string, string> = {
  IDEA: "bg-gray-100 text-gray-800",
  VALIDATION: "bg-blue-100 text-blue-800",
  BUILDING: "bg-yellow-100 text-yellow-800",
  LAUNCHED: "bg-green-100 text-green-800",
  SCALING: "bg-purple-100 text-purple-800",
};

const VERDICT_COLORS: Record<string, string> = {
  ON_TRACK: "text-green-600",
  NEEDS_ATTENTION: "text-yellow-600",
  AT_RISK: "text-red-600",
};

export function StartupsList() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteStartups();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center text-destructive">
          Failed to load startups. Please try again.
        </CardContent>
      </Card>
    );
  }

  const startups = data?.pages.flatMap((page) => page.data) ?? [];

  if (startups.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No startups yet</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Start tracking your progress by creating a startup profile
          </p>
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link href="/startups/new">
                <Plus className="mr-2 h-4 w-4" />
                New Startup
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ideas">
                From an Idea
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {startups.map((startup: StartupWithDetails) => {
          const latestUpdate = startup.weeklyUpdates?.[0];
          const score = startup.idea?.scores?.[0]?.overallScore;
          const weekNumber = getWeeksSinceCreation(startup.createdAt);
          const submissionCount = startup._count?.weeklyUpdates || 0;

          return (
            <Link
              key={startup.id}
              href={`/startups/${startup.slug}`}
              className="group"
            >
              <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1 text-lg">
                        {startup.name}
                      </CardTitle>
                      {startup.tagline && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {startup.tagline}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={STAGE_COLORS[startup.stage] || ""}
                    >
                      {startup.stage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>
                        Week {weekNumber} ({submissionCount} update
                        {submissionCount !== 1 ? "s" : ""})
                      </span>
                    </div>
                    {score && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-medium">{score}/100</span>
                      </div>
                    )}
                  </div>

                  {latestUpdate && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Latest Verdict
                        </span>
                        <span
                          className={`font-medium ${
                            (latestUpdate.aiVerdict &&
                              VERDICT_COLORS[latestUpdate.aiVerdict]) ||
                            "text-muted-foreground"
                          }`}
                        >
                          {latestUpdate.aiVerdict?.replace(/_/g, " ") ||
                            "Pending"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {startup.primaryMetricType}:{" "}
                        {startup.primaryMetricValue ??
                          latestUpdate.primaryMetricValue}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isFetching={isFetching}
      />
    </>
  );
}
