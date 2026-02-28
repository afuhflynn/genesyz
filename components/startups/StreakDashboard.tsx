"use client";

import { AlertTriangle, Flame, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastUpdateWeek: string | null;
  isAtRisk: boolean;
  nextMilestone: number;
  weeksToMilestone: number;
}

interface StreakDashboardProps {
  streak: StreakData;
  isLoading?: boolean;
}

const MILESTONE_BADGES: Record<number, { label: string; color: string }> = {
  4: { label: "Getting Started", color: "bg-blue-100 text-blue-800" },
  8: { label: "On Fire", color: "bg-orange-100 text-orange-800" },
  12: { label: "Dedicated", color: "bg-yellow-100 text-yellow-800" },
  16: { label: "Warrior", color: "bg-purple-100 text-purple-800" },
  20: { label: "Champion", color: "bg-green-100 text-green-800" },
  24: { label: "Legend", color: "bg-red-100 text-red-800" },
  52: { label: "Unstoppable", color: "bg-amber-100 text-amber-800" },
};

export function StreakDashboard({ streak, isLoading }: StreakDashboardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Weekly Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressToMilestone =
    streak.currentStreak > 0
      ? ((streak.currentStreak % streak.nextMilestone) / streak.nextMilestone) *
        100
      : 0;

  const currentBadge = MILESTONE_BADGES[streak.currentStreak] || null;
  const showFlames = streak.currentStreak >= 4;

  return (
    <Card className={streak.isAtRisk ? "border-orange-200" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame
              className={`h-5 w-5 ${streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`}
            />
            Weekly Streak
          </span>
          {streak.isAtRisk && (
            <span className="flex items-center gap-1 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              At Risk
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Streak Display */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2">
            {showFlames && (
              <span className="text-2xl">
                {"🔥".repeat(Math.min(3, Math.floor(streak.currentStreak / 4)))}
              </span>
            )}
            <span className="text-5xl font-bold">{streak.currentStreak}</span>
            <span className="text-xl text-muted-foreground">weeks</span>
          </div>
          {currentBadge && (
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${currentBadge.color}`}
            >
              {currentBadge.label}
            </span>
          )}
        </div>

        {/* Progress to Next Milestone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next milestone</span>
            <span className="font-medium">{streak.nextMilestone} weeks</span>
          </div>
          <Progress value={progressToMilestone} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {streak.weeksToMilestone} more week
            {streak.weeksToMilestone !== 1 ? "s" : ""} to reach{" "}
            {streak.nextMilestone} weeks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Longest</span>
            </div>
            <p className="text-xl font-bold">{streak.longestStreak}</p>
            <p className="text-xs text-muted-foreground">weeks</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">This Week</span>
            </div>
            <p className="text-xl font-bold">
              {streak.lastUpdateWeek ? "✅" : "⭕"}
            </p>
            <p className="text-xs text-muted-foreground">
              {streak.lastUpdateWeek ? "Done" : "Pending"}
            </p>
          </div>
        </div>

        {/* Warning if at risk */}
        {streak.isAtRisk && (
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-center">
            <p className="text-sm text-orange-800">
              Submit your weekly update to keep your streak alive!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
