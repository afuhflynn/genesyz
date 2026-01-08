"use client";

import { useDashboard } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lightbulb, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/ideas/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalIdeas || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.usage.activeIdeas} active /{" "}
              {data?.usage.maxIdeas === 999999
                ? "Unlimited"
                : data?.usage.maxIdeas}{" "}
              allowed
            </p>
          </CardContent>
        </Card>
        </motion.div>
        <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Researched</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.researchedIdeas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fully analyzed by AI
            </p>
          </CardContent>
        </Card>
        </motion.div>
        <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.averageScore || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all researched ideas
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Recent Ideas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data?.recentIdeas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No ideas yet. Start by creating one!
                </div>
              ) : (
                data?.recentIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="hover:underline"
                        >
                          {idea.title || "Untitled Idea"}
                        </Link>
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {idea.summary || "No summary available"}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {idea.status === "RESEARCHED" ? (
                        <Badge
                          variant={getScoreVariant(
                            idea.scores[0]?.overallScore
                          )}
                        >
                          {idea.scores[0]?.overallScore || 0}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="capitalize">
                          {idea.status.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Ideas */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Rated Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data?.topIdeas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No researched ideas yet.
                </div>
              ) : (
                data?.topIdeas.map((idea) => (
                  <div key={idea.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="hover:underline"
                        >
                          {idea.title}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(idea.createdAt)}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <span className="text-lg font-bold">
                        {idea.scores[0]?.overallScore}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getScoreVariant(
  score?: number
): "default" | "secondary" | "destructive" | "outline" {
  if (!score) return "outline";
  if (score >= 80) return "default"; // High score (green-ish in default theme usually, but depends on config)
  if (score >= 50) return "secondary"; // Medium
  return "destructive"; // Low
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-5 w-10" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="ml-auto">
                      <Skeleton className="h-6 w-8" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
