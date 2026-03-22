"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  Pencil,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartup, useToggleGoalCompletion, useWeeklyUpdates } from "@/hooks";
import { formatMetricValue, getMetricFormat } from "@/lib/constants/metrics";

const VERDICT_CONFIG: Record<
  string,
  { color: string; icon: typeof TrendingUp; label: string }
> = {
  ON_TRACK: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: TrendingUp,
    label: "On Track",
  },
  NEEDS_ATTENTION: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: Zap,
    label: "Needs Attention",
  },
  AT_RISK: {
    color: "text-red-600 bg-red-50 border-red-200",
    icon: TrendingDown,
    label: "At Risk",
  },
};

interface WeeklyUpdatesListProps {
  slug: string;
}

export function WeeklyUpdatesList({ slug }: WeeklyUpdatesListProps) {
  const { data: startup, isLoading: startupLoading } = useStartup(slug);
  const { data: updatesData, isLoading: updatesLoading } = useWeeklyUpdates(
    startup?.id || "",
  );
  const toggleGoal = useToggleGoalCompletion(startup?.id || "");

  const isLoading = startupLoading || updatesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">Startup not found</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const updates = updatesData?.data || [];
  const latestUpdates = updates.slice(0, 8);

  // Chart data: primary metric
  const metricChartData = [...latestUpdates].reverse().map((update) => ({
    week: `W${update.weekNumber}`,
    value: update.primaryMetricValue,
    delta: update.primaryMetricDelta,
    fullDate: format(new Date(update.weekStart), "MMM d"),
  }));

  // Chart data: user conversations
  const conversationsChartData = [...latestUpdates].reverse().map((update) => ({
    week: `W${update.weekNumber}`,
    value: update.usersTalkedTo,
    fullDate: format(new Date(update.weekStart), "MMM d"),
  }));

  // Collect unique additional metric types
  const additionalMetricTypes = Array.from(
    new Set(
      updates.flatMap((u) => (u.additionalMetrics || []).map((m) => m.type)),
    ),
  );

  const primaryMetricLabel = startup.primaryMetricType
    .replace(/_/g, " ")
    .toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/startups/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Weekly Updates
            </h1>
            <p className="text-muted-foreground">{startup.name}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/startups/${slug}/updates/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Update
          </Link>
        </Button>
      </div>

      {/* Metrics Overview */}
      {updates.length > 0 && (
        <div className="space-y-6">
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Metrics Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Progress across all weekly updates
            </p>
          </div>

          {/* Primary Metric Chart */}
          {metricChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{primaryMetricLabel} History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {metricChartData.length > 1 && (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metricChartData}>
                          <defs>
                            <linearGradient
                              id="updatesColorPrimary"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="week"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-md">
                                    <p className="text-sm font-medium">
                                      {data.fullDate}
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                      {data.value}
                                    </p>
                                    {data.delta !== null &&
                                      data.delta !== undefined && (
                                        <p
                                          className={`text-xs ${
                                            data.delta >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {data.delta >= 0 ? "+" : ""}
                                          {data.delta.toFixed(1)}%
                                        </p>
                                      )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#updatesColorPrimary)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-2">
                    {latestUpdates.map((update) => (
                      <div
                        key={update.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">
                            Week {update.weekNumber}
                          </p>
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
                              {update.primaryMetricDelta.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Conversations Chart */}
          {conversationsChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {conversationsChartData.length > 1 && (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={conversationsChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="week"
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            className="text-xs"
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-md">
                                    <p className="text-sm font-medium">
                                      {data.fullDate}
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                      {data.value} conversations
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981", strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-2">
                    {latestUpdates.map((update) => (
                      <div
                        key={`users-${update.id}`}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">
                            Week {update.weekNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(update.weekStart), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {update.usersTalkedTo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            conversations
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Metrics Charts */}
          {additionalMetricTypes.map((metricType) => {
            const metricLabel = metricType.replace(/_/g, " ").toLowerCase();
            const metricFmt = getMetricFormat(metricType) as
              | "CURRENCY"
              | "PERCENTAGE"
              | "NUMBER";
            const gradientId = `updatesColorAdditional_${metricType}`;

            const chartData = [...latestUpdates]
              .filter((u) =>
                u.additionalMetrics?.some((m) => m.type === metricType),
              )
              .reverse()
              .map((update, _idx, arr) => {
                const metric = update.additionalMetrics?.find(
                  (m) => m.type === metricType,
                );
                if (!metric) return null;

                const prevUpdate = arr
                  .slice(0, _idx)
                  .reverse()
                  .find((u) =>
                    u.additionalMetrics?.some((m) => m.type === metricType),
                  );
                const prevMetric = prevUpdate?.additionalMetrics?.find(
                  (m) => m.type === metricType,
                );

                let delta: number | null = null;
                if (prevMetric && prevMetric.value !== 0) {
                  delta =
                    ((metric.value - prevMetric.value) / prevMetric.value) *
                    100;
                }

                return {
                  week: `W${update.weekNumber}`,
                  value: metric.value,
                  delta,
                  fullDate: format(new Date(update.weekStart), "MMM d"),
                };
              })
              .filter((d): d is NonNullable<typeof d> => d !== null);

            if (chartData.length === 0) return null;

            return (
              <Card key={metricType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {metricLabel} History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {chartData.length > 1 && (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id={gradientId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#8b5cf6"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#8b5cf6"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-muted"
                            />
                            <XAxis
                              dataKey="week"
                              className="text-xs"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              className="text-xs"
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="rounded-lg border bg-background p-2 shadow-md">
                                      <p className="text-sm font-medium">
                                        {data.fullDate}
                                      </p>
                                      <p className="text-lg font-bold text-primary">
                                        {formatMetricValue(
                                          data.value,
                                          metricFmt,
                                        )}
                                      </p>
                                      {data.delta !== null &&
                                        data.delta !== undefined && (
                                          <p
                                            className={`text-xs ${
                                              data.delta >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                          >
                                            {data.delta >= 0 ? "+" : ""}
                                            {data.delta.toFixed(1)}%
                                          </p>
                                        )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill={`url(#${gradientId})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div className="space-y-2">
                      {latestUpdates.map((update) => {
                        const metric = update.additionalMetrics?.find(
                          (m) => m.type === metricType,
                        );
                        if (!metric) return null;

                        const prevUpdate = updates
                          .filter(
                            (u) =>
                              u.weekNumber < update.weekNumber &&
                              u.additionalMetrics?.some(
                                (m) => m.type === metricType,
                              ),
                          )
                          .sort((a, b) => b.weekNumber - a.weekNumber)[0];
                        const prevMetric = prevUpdate?.additionalMetrics?.find(
                          (m) => m.type === metricType,
                        );

                        let delta: number | null = null;
                        if (prevMetric && prevMetric.value !== 0) {
                          delta =
                            ((metric.value - prevMetric.value) /
                              prevMetric.value) *
                            100;
                        }

                        return (
                          <div
                            key={`${update.id}-${metricType}`}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="font-medium">
                                Week {update.weekNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(update.weekStart), "MMM d")} -{" "}
                                {format(
                                  new Date(update.weekEnd),
                                  "MMM d, yyyy",
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">
                                {formatMetricValue(metric.value, metricFmt)}
                              </p>
                              {delta !== null && (
                                <p
                                  className={`text-sm ${
                                    delta >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {delta >= 0 ? "+" : ""}
                                  {delta.toFixed(1)}%
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Updates List */}
      {updates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No updates yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Start tracking your weekly progress
            </p>
            <Button asChild className="mt-4">
              <Link href={`/startups/${slug}/updates/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Update
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {updates.map((update) => {
            const verdict = update.aiVerdict
              ? VERDICT_CONFIG[update.aiVerdict]
              : null;
            const VerdictIcon = verdict?.icon || Target;
            const completedGoals =
              update.goals?.filter((g) => g.completed).length || 0;
            const totalGoals = update.goals?.length || 0;

            // Check if update is still editable
            const now = new Date();
            const editableUntil = update.editableUntil
              ? new Date(update.editableUntil)
              : null;
            const isEditable =
              editableUntil && !update.isLocked && editableUntil > now;
            const timeLeft =
              editableUntil && editableUntil > now
                ? formatDistanceToNow(editableUntil, { addSuffix: true })
                : null;

            return (
              <AccordionItem
                key={update.id}
                value={update.id}
                className="rounded-lg border bg-card"
              >
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Week {update.weekNumber}
                          </span>
                          {verdict && (
                            <Badge variant="outline" className={verdict.color}>
                              <VerdictIcon className="mr-1 h-3 w-3" />
                              {verdict.label}
                            </Badge>
                          )}
                          {update.isLaunched && (
                            <Badge className="bg-green-600">Launched</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(update.weekStart), "MMM d")} -{" "}
                          {format(new Date(update.weekEnd), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <div className="font-medium">
                          {update.primaryMetricValue}{" "}
                          {update.primaryMetricType
                            .replace(/_/g, " ")
                            .toLowerCase()}
                        </div>
                        {update.primaryMetricDelta !== null && (
                          <div
                            className={
                              update.primaryMetricDelta >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {update.primaryMetricDelta >= 0 ? "+" : ""}
                            {update.primaryMetricDelta.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {update.usersTalkedTo} users
                        </div>
                        <div className="text-muted-foreground">talked to</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {update.moraleScore}/10
                        </div>
                        <div className="text-muted-foreground">morale</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {completedGoals}/{totalGoals}
                        </div>
                        <div className="text-muted-foreground">goals</div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* User Learnings */}
                    {update.userLearnings && (
                      <div>
                        <h4 className="mb-2 font-medium">
                          What you learned from users
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {update.userLearnings}
                        </p>
                      </div>
                    )}

                    {/* Goals */}
                    {update.goals && update.goals.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-medium">Goals</h4>
                        <div className="space-y-2">
                          {update.goals.map((goal, idx) => (
                            <button
                              key={`goal-${update.id}-${goal.id || idx}`}
                              type="button"
                              onClick={() =>
                                goal.id && toggleGoal.mutate(goal.id)
                              }
                              disabled={toggleGoal.isPending}
                              className="flex w-full items-start gap-2 rounded-lg border p-2 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                            >
                              {goal.completed ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              )}
                              <span
                                className={`text-sm ${
                                  goal.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {goal.content}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reflections */}
                    {(update.topImprovements || update.biggestObstacle) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {update.topImprovements && (
                          <div>
                            <h4 className="mb-2 font-medium">
                              What improved the metric
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {update.topImprovements}
                            </p>
                          </div>
                        )}
                        {update.biggestObstacle && (
                          <div>
                            <h4 className="mb-2 font-medium">
                              Biggest obstacle
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {update.biggestObstacle}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Analysis */}
                    {update.aiAnalysis && (
                      <div className="rounded-lg bg-muted/50 p-4">
                        <h4 className="mb-3 font-medium">AI Analysis</h4>
                        {update.aiAnalysis.analysis?.positives?.length > 0 && (
                          <div className="mb-3">
                            <p className="mb-1 text-sm font-medium text-green-700">
                              Positives:
                            </p>
                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                              {update.aiAnalysis.analysis.positives.map(
                                (item: string, i: number) => (
                                  <li key={`pos-${update.id}-${i}`}>{item}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                        {update.aiAnalysis.analysis?.concerns?.length > 0 && (
                          <div className="mb-3">
                            <p className="mb-1 text-sm font-medium text-yellow-700">
                              Concerns:
                            </p>
                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                              {update.aiAnalysis.analysis.concerns.map(
                                (item: string, i: number) => (
                                  <li key={`con-${update.id}-${i}`}>{item}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                        {update.aiRecommendations?.length > 0 && (
                          <div>
                            <p className="mb-1 text-sm font-medium">
                              Recommendations:
                            </p>
                            <ul className="list-inside list-disc text-sm text-muted-foreground">
                              {update.aiRecommendations.map(
                                (item: string, i: number) => (
                                  <li key={`rec-${update.id}-${i}`}>{item}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit Button & Time Remaining */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      {isEditable && timeLeft ? (
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Edit window: {timeLeft}
                          </Badge>
                          <Button asChild size="sm">
                            <Link
                              href={`/startups/${slug}/updates/${update.id}/edit`}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Update
                            </Link>
                          </Button>
                        </div>
                      ) : update.isLocked ||
                        (editableUntil && editableUntil <= now) ? (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-500 border-gray-200"
                        >
                          Editing window closed
                        </Badge>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
