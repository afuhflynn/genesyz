"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StreakDashboard } from "@/components/startups/StreakDashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartupStreak } from "@/hooks";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastUpdateWeek: string | null;
  isAtRisk: boolean;
  nextMilestone: number;
  weeksToMilestone: number;
}

export default function StreaksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params?.then((p) => setSlug(p?.slug));
  }, [params]);

  const { data: streak, isLoading } = useStartupStreak(slug);

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Weekly Streaks
        </h1>
      </div>

      {streak ? (
        <StreakDashboard streak={streak} isLoading={isLoading} />
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No streak data available yet.</p>
          <p className="text-sm mt-2">
            Submit your first weekly update to start tracking!
          </p>
        </div>
      )}

      {/* Milestones Guide */}
      <div className="rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Milestones</h3>
        <div className="grid grid-cols-4 gap-4 text-center text-sm">
          <div className="p-3 rounded-lg bg-blue-50">
            <div className="text-lg mb-1">🔥</div>
            <div className="font-medium">4 weeks</div>
            <div className="text-muted-foreground text-xs">Getting Started</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-50">
            <div className="text-lg mb-1">🔥🔥</div>
            <div className="font-medium">8 weeks</div>
            <div className="text-muted-foreground text-xs">On Fire</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50">
            <div className="text-lg mb-1">🔥🔥🔥</div>
            <div className="font-medium">12 weeks</div>
            <div className="text-muted-foreground text-xs">Dedicated</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-50">
            <div className="text-lg mb-1">🔥🔥🔥🔥</div>
            <div className="font-medium">24 weeks</div>
            <div className="text-muted-foreground text-xs">Legend</div>
          </div>
        </div>
      </div>
    </div>
  );
}
