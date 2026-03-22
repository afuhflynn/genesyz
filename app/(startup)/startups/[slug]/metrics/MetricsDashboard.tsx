"use client";

import { format } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartup, useWeeklyUpdates } from "@/hooks";
import { formatMetricValue, getMetricFormat } from "@/lib/constants/metrics";

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

  // Prepare chart data (reverse to show chronological order)
  const metricChartData = [...latestUpdates].reverse().map((update) => ({
    week: `W${update.weekNumber}`,
    value: update.primaryMetricValue,
    delta: update.primaryMetricDelta,
    fullDate: format(new Date(update.weekStart), "MMM d"),
  }));

  const conversationsChartData = [...latestUpdates].reverse().map((update) => ({
    week: `W${update.weekNumber}`,
    value: update.usersTalkedTo,
    fullDate: format(new Date(update.weekStart), "MMM d"),
  }));

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

      {/* Primary Metric History - Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{primaryMetricLabel} History</CardTitle>
        </CardHeader>
        <CardContent>
          {latestUpdates.length > 0 ? (
            <div className="space-y-6">
              {/* Chart */}
              {metricChartData.length > 1 && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricChartData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
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
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* List */}
              <div className="space-y-2">
                {latestUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="flex items-center justify-between rounded-lg border p-3"
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
                          {update.primaryMetricDelta.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

      {/* User Conversations - Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {latestUpdates.length > 0 ? (
            <div className="space-y-6">
              {/* Chart */}
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

              {/* List */}
              <div className="space-y-2">
                {latestUpdates.map((update) => (
                  <div
                    key={`users-${update.id}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">Week {update.weekNumber}</p>
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
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      {(() => {
        const updatesWithAdditional = latestUpdates.filter(
          (u) => u.additionalMetrics && u.additionalMetrics.length > 0,
        );

        if (updatesWithAdditional.length === 0) return null;

        const metricTypeSet = new Set<string>();
        for (const u of updatesWithAdditional) {
          for (const m of u.additionalMetrics || []) {
            metricTypeSet.add(m.type);
          }
        }
        const metricTypes = Array.from(metricTypeSet);

        return metricTypes.map((metricType) => {
          const metricLabel = metricType.replace(/_/g, " ").toLowerCase();
          const metricFmt = getMetricFormat(metricType) as
            | "CURRENCY"
            | "PERCENTAGE"
            | "NUMBER";

          const chartData = [...updatesWithAdditional]
            .reverse()
            .map((update) => {
              const metric = update.additionalMetrics?.find(
                (m) => m.type === metricType,
              );
              return {
                week: `W${update.weekNumber}`,
                value: metric?.value ?? null,
                fullDate: format(new Date(update.weekStart), "MMM d"),
              };
            })
            .filter((d) => d.value !== null);

          if (chartData.length === 0) return null;

          return (
            <Card key={metricType}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {metricLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {chartData.length > 1 && (
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
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
                                      {formatMetricValue(data.value, metricFmt)}
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
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="space-y-2">
                    {[...updatesWithAdditional].reverse().map((update) => {
                      const metric = update.additionalMetrics?.find(
                        (m) => m.type === metricType,
                      );
                      if (!metric) return null;
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
                              {format(
                                new Date(update.weekStart),
                                "MMM d, yyyy",
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">
                              {formatMetricValue(metric.value, metricFmt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        });
      })()}
    </div>
  );
}
