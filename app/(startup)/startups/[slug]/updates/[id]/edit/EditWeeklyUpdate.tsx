"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeeklyUpdateForm } from "@/components/startups";
import { Button } from "@/components/ui/button";

interface EditWeeklyUpdateProps {
  startupId: string;
  startupSlug: string;
  startupName: string;
  weekNumber: number;
  submissionCount: number;
  isLaunched: boolean;
  currentPrimaryMetric: string;
  previousGoals: string[];
  existingUpdate: {
    id: string;
    weekNumber: number;
    isLaunched: boolean;
    weeksToLaunch: number | null;
    usersTalkedTo: number;
    userLearnings: string | null;
    primaryMetricType: string;
    primaryMetricValue: number;
    metricPeriod: string | null;
    metricFormat: string | null;
    customMetricName: string | null;
    additionalMetrics: Array<{
      type: string;
      value: number;
      period?: string | null;
      customMetricName?: string | null;
    }> | null;
    previousGoalsReview: Array<{
      goalText: string;
      completed: boolean;
    }> | null;
    goalsCompletionRate: number | null;
    moraleScore: number;
    topImprovements: string | null;
    biggestObstacle: string | null;
    editableUntil: Date | null;
    isLocked: boolean;
    goals: Array<{
      id: string;
      content: string;
      priority: number;
      completed: boolean;
    }>;
  };
}

export function EditWeeklyUpdate({
  startupId,
  startupSlug,
  startupName,
  weekNumber,
  submissionCount,
  isLaunched,
  currentPrimaryMetric,
  previousGoals,
  existingUpdate,
}: EditWeeklyUpdateProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${startupSlug}/updates`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Week {weekNumber} Update
          </h1>
          <p className="text-muted-foreground">
            {startupName} • {submissionCount} update
            {submissionCount !== 1 ? "s" : ""} submitted
          </p>
        </div>
      </div>

      <WeeklyUpdateForm
        startupId={startupId}
        currentWeekNumber={weekNumber}
        isLaunched={isLaunched}
        currentPrimaryMetric={currentPrimaryMetric}
        previousGoals={previousGoals}
        existingUpdate={existingUpdate}
        onSuccess={() => {
          router.push(`/startups/${startupSlug}/updates`);
        }}
      />
    </div>
  );
}
