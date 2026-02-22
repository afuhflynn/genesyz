"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  Calendar,
  Edit3,
  HeartHandshake,
  Plus,
  School,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartup } from "@/hooks";
import { getWeeksSinceCreation } from "@/lib/utils/date";

const STAGE_COLORS: Record<string, string> = {
  IDEA: "bg-gray-100 text-gray-800",
  VALIDATION: "bg-blue-100 text-blue-800",
  BUILDING: "bg-yellow-100 text-yellow-800",
  LAUNCHED: "bg-green-100 text-green-800",
  SCALING: "bg-purple-100 text-purple-800",
};

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

export function StartupDashboard({ slug }: { slug: string }) {
  const { data: startup, isLoading, error } = useStartup(slug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !startup) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">Failed to load startup</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const weekNumber = getWeeksSinceCreation(startup.createdAt);
  const submissionCount = startup._count?.weeklyUpdates ?? 0;
  const latestUpdate = startup.weeklyUpdates?.[0];
  const verdict = latestUpdate?.aiVerdict
    ? VERDICT_CONFIG[latestUpdate.aiVerdict]
    : null;
  const VerdictIcon = verdict?.icon || Target;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {startup.name}
            </h1>
            <Badge variant="secondary" className={STAGE_COLORS[startup.stage]}>
              {startup.stage}
            </Badge>
            {startup.isLaunched && (
              <Badge variant="default" className="bg-green-600">
                Launched
              </Badge>
            )}
          </div>
          {startup.tagline && (
            <p className="text-muted-foreground">{startup.tagline}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Week {weekNumber} ({submissionCount} update
              {submissionCount !== 1 ? "s" : ""})
            </span>
            {startup.industry && (
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {startup.industry}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/startups/${startup.slug}/profile`}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/startups/${startup.slug}/updates/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Weekly Update
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Primary Metric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {startup.primaryMetricValue ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {startup.primaryMetricType.replace(/_/g, " ").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestUpdate?.usersTalkedTo ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Morale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestUpdate?.moraleScore ?? "-"}/10
            </div>
            <p className="text-xs text-muted-foreground">Founder mood</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {startup._count?.weeklyUpdates ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Weekly reports</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Verdict */}
      {verdict && latestUpdate?.aiAnalysis && (
        <Card className={`border ${verdict.color}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <VerdictIcon className="h-5 w-5" />
                {verdict.label}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Week {latestUpdate.weekNumber}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {latestUpdate.aiAnalysis?.analysis?.positives?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-green-700">
                  What's working:
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-green-600">
                  {latestUpdate.aiAnalysis.analysis.positives
                    .slice(0, 2)
                    .map((item: string, i: number) => (
                      <li key={`pos-${i}`}>{item}</li>
                    ))}
                </ul>
              </div>
            )}
            {latestUpdate.aiAnalysis?.analysis?.concerns?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-yellow-700">
                  Watch out:
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-yellow-600">
                  {latestUpdate.aiAnalysis.analysis.concerns
                    .slice(0, 2)
                    .map((item: string, i: number) => (
                      <li key={`con-${i}`}>{item}</li>
                    ))}
                </ul>
              </div>
            )}
            {latestUpdate.aiRecommendations?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Next focus:</p>
                <p className="text-sm text-muted-foreground">
                  {latestUpdate.aiRecommendations[0]}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/startups/${startup.slug}/updates`} className="group">
          <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Weekly Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/startups/${startup.slug}/school`} className="group">
          <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-blue-100 p-3">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Startup School</h3>
                <p className="text-sm text-muted-foreground">Learn & grow</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/startups/${startup.slug}/cofounders`} className="group">
          <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-purple-100 p-3">
                <HeartHandshake className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Co-Founder Match</h3>
                <p className="text-sm text-muted-foreground">
                  Find your partner
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/ideas/${startup.ideaId}`} className="group">
          <Card className="h-full transition-colors hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-orange-100 p-3">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">Original Idea</h3>
                <p className="text-sm text-muted-foreground">View research</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Updates</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/startups/${startup.slug}/updates`}>
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {startup.weeklyUpdates?.length > 0 ? (
            <div className="space-y-4">
              {startup.weeklyUpdates.slice(0, 5).map((update) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Week {update.weekNumber}
                      </span>
                      {update.aiVerdict && (
                        <Badge
                          variant="outline"
                          className={
                            VERDICT_CONFIG[update.aiVerdict]?.color || ""
                          }
                        >
                          {VERDICT_CONFIG[update.aiVerdict]?.label ||
                            update.aiVerdict}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(update.weekStart), "MMM d")} -{" "}
                      {format(new Date(update.weekEnd), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {update.primaryMetricValue}{" "}
                      {update.primaryMetricType
                        .replace(/_/g, " ")
                        .toLowerCase()}
                    </div>
                    <div className="text-muted-foreground">
                      {update.goals?.filter((g) => g.completed).length || 0}/
                      {update.goals?.length || 0} goals
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2">No weekly updates yet</p>
              <Button asChild className="mt-4">
                <Link href={`/startups/${startup.slug}/updates/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Update
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
