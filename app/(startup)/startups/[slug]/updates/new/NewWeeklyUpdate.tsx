"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeeklyUpdateForm } from "@/components/startups";
import { Button } from "@/components/ui/button";

interface NewWeeklyUpdateProps {
  startupId: string;
  startupSlug: string;
  startupName: string;
  currentWeekNumber: number;
  isLaunched: boolean;
  currentPrimaryMetric: string;
  previousGoals: string[];
}

export function NewWeeklyUpdate({
  startupId,
  startupSlug,
  startupName,
  currentWeekNumber,
  isLaunched,
  currentPrimaryMetric,
  previousGoals,
}: NewWeeklyUpdateProps) {
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
            Week {currentWeekNumber} Update
          </h1>
          <p className="text-muted-foreground">{startupName}</p>
        </div>
      </div>

      <WeeklyUpdateForm
        startupId={startupId}
        startupName={startupName}
        currentWeekNumber={currentWeekNumber}
        isLaunched={isLaunched}
        currentPrimaryMetric={currentPrimaryMetric}
        previousGoals={previousGoals}
        onSuccess={() => {
          router.push(`/startups/${startupSlug}/updates`);
        }}
      />
    </div>
  );
}
