"use client";

import { CheckCircle, Circle } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PreviousGoalReviewInput } from "@/lib/validators/startup";

interface PreviousGoalsReviewProps {
  previousGoals: string[];
  value: PreviousGoalReviewInput[];
  onChange: (review: PreviousGoalReviewInput[]) => void;
  onCompletionRateChange: (rate: number) => void;
}

export function PreviousGoalsReview({
  previousGoals,
  value,
  onChange,
  onCompletionRateChange,
}: PreviousGoalsReviewProps) {
  useEffect(() => {
    if (previousGoals.length > 0 && value.length === 0) {
      const initialReview: PreviousGoalReviewInput[] = previousGoals.map(
        (goal) => ({
          goalText: goal,
          completed: false,
        }),
      );
      onChange(initialReview);
    }
  }, [previousGoals, value.length, onChange]);

  const completionRate = useMemo(() => {
    if (value.length === 0) return 0;
    const completed = value.filter((g) => g.completed).length;
    return completed / value.length;
  }, [value]);

  useEffect(() => {
    onCompletionRateChange(completionRate);
  }, [completionRate, onCompletionRateChange]);

  const toggleGoal = (index: number) => {
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      completed: !updated[index].completed,
    };
    onChange(updated);
  };

  if (previousGoals.length === 0) {
    return null;
  }

  const completedCount = value.filter((g) => g.completed).length;
  const totalCount = value.length;
  const percentage = Math.round(completionRate * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Review Last Week&apos;s Goals
            </CardTitle>
            <CardDescription>Mark the goals you completed</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {completedCount}/{totalCount}
            </div>
            <div className="text-sm text-muted-foreground">
              {percentage}% completed
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {value.map((goal, index) => (
          <button
            key={`${goal.goalText}-${index}`}
            type="button"
            onClick={() => toggleGoal(index)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
              goal.completed
                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                : "bg-muted/50 hover:bg-muted"
            }`}
          >
            {goal.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${
                goal.completed
                  ? "text-green-700 dark:text-green-400 line-through"
                  : ""
              }`}
            >
              {goal.goalText}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
