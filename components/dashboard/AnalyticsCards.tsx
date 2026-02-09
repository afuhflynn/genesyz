"use client";

import { Calendar, Globe, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PortfolioMetrics {
  totalIdeas: number;
  activeIdeas: number;
  averageScore: number;
  scoreChange: number;
  totalResearched: number;
  researchedChange: number;
  goVerdicts: number;
  pauseVerdicts: number;
  killVerdicts: number;
}

interface AnalyticsCardsProps {
  metrics: PortfolioMetrics;
}

export function AnalyticsCards({ metrics }: AnalyticsCardsProps) {
  const scoreTrend =
    metrics.scoreChange > 0
      ? "up"
      : metrics.scoreChange < 0
        ? "down"
        : "neutral";

  const researchedTrend =
    metrics.researchedChange > 0
      ? "up"
      : metrics.researchedChange < 0
        ? "down"
        : "neutral";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Ideas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalIdeas}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.activeIdeas} active
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageScore}</div>
          <div className="flex items-center gap-1">
            {scoreTrend === "up" && (
              <TrendingUp className="h-3 w-3 text-green-500" />
            )}
            {scoreTrend === "down" && (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            {scoreTrend === "neutral" && (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
            <span
              className={cn(
                "text-xs",
                scoreTrend === "up" && "text-green-500",
                scoreTrend === "down" && "text-red-500",
                scoreTrend === "neutral" && "text-muted-foreground",
              )}
            >
              {metrics.scoreChange > 0 ? "+" : ""}
              {metrics.scoreChange} from last week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Research Complete */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Researched</CardTitle>
          <Badge
            variant="secondary"
            className="h-4 w-4 p-0 flex items-center justify-center"
          >
            <span className="text-xs">✓</span>
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalResearched}</div>
          <div className="flex items-center gap-1">
            {researchedTrend === "up" && (
              <TrendingUp className="h-3 w-3 text-green-500" />
            )}
            {researchedTrend === "down" && (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            {researchedTrend === "neutral" && (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {metrics.researchedChange > 0 ? "+" : ""}
              {metrics.researchedChange} this week
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Verdict Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Verdict Breakdown
          </CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge className="bg-green-500">{metrics.goVerdicts} Go</Badge>
            <Badge className="bg-yellow-500">
              {metrics.pauseVerdicts} Pause
            </Badge>
            <Badge className="bg-red-500">{metrics.killVerdicts} Kill</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
