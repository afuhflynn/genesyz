"use client";

import { format } from "date-fns";
import { ArrowLeft, Target, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartup, useWeeklyUpdates } from "@/hooks";

interface MetricsDashboardProps {
  slug: string;
}

export function MetricsDashboard({ slug }: MetricsDashboardProps) {
  const { data: startup, isLoading: startupLoading } = useStartup(slug);
  const { data: updatesData, isLoading: updatesLoading } = useWeeklyUpdates(
    startup?.id || "",
  );

  const isLoading = startupLoading || updatesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">Startup not found</p>
        </CardContent>
      </Card>
    );
  }

  const updates = updatesData?.data || [];
  const latestUpdates = updates.slice(0, 8);

  const primaryMetricLabel = startup.primaryMetricType
    .replace(/_/g, " ")
    .toLowerCase();

  const calculateTrend = () => {
    if (latestUpdates.length < 2) return null;

    const current = latestUpdates[0].primaryMetricValue;
    const previous = latestUpdates[1].primaryMetricValue;

    if (previous === 0) return null;

    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const trend = calculateTrend();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Metrics</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current {primaryMetricLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {startup.primaryMetricValue ?? 0}
            </div>
            {trend !== null && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>
                  {trend >= 0 ? "+" : ""}
                  {trend.toFixed(1)}% from last week
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{updates.length}</div>
            <p className="text-sm text-muted-foreground">Weekly reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Morale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {updates.length > 0
                ? (
                    updates.reduce((sum, u) => sum + u.moraleScore, 0) /
                    updates.length
                  ).toFixed(1)
                : "-"}
              /10
            </div>
            <p className="text-sm text-muted-foreground">Founder mood</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Metric History */}
      <Card>
        <CardHeader>
          <CardTitle>{primaryMetricLabel} History</CardTitle>
        </CardHeader>
        <CardContent>
          {latestUpdates.length > 0 ? (
            <div className="space-y-4">
              {latestUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">Week {update.weekNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(update.weekStart), "MMM d")} -{" "}
                      {format(new Date(update.weekEnd), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {update.primaryMetricValue}
                    </p>
                    {update.primaryMetricDelta !== null && (
                      <p
                        className={`text-sm ${
                          update.primaryMetricDelta >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {update.primaryMetricDelta >= 0 ? "+" : ""}
                        {update.primaryMetricDelta.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Target className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2">No metrics data yet</p>
              <p className="text-sm">
                Submit your first weekly update to start tracking metrics
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Talked To */}
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {latestUpdates.length > 0 ? (
            <div className="space-y-4">
              {latestUpdates.map((update) => (
                <div
                  key={`users-${update.id}`}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">Week {update.weekNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(update.weekStart), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{update.usersTalkedTo}</p>
                    <p className="text-sm text-muted-foreground">
                      conversations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
