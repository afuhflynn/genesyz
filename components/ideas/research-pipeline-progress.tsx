"use client";

import { motion } from "framer-motion";
import { useRealtime } from "inngest/react";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  GitBranch,
  Loader2,
  Radar,
  Search,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchRealtimeSubscriptionToken } from "@/app/api/inngest/token/_actions/fetchRealtimeSubscriptionToken";
import { ideaChannel } from "@/lib/inngest/channels";
import { Button } from "@/components/ui/button";

const agents = [
  {
    key: "parse.idea",
    name: "Interpreter",
    icon: Brain,
    color: "text-violet-500",
  },
  {
    key: "research.started",
    name: "Market Research",
    icon: Search,
    color: "text-blue-500",
  },
  {
    key: "research.progress",
    name: "Trend Analysis",
    icon: TrendingUp,
    color: "text-orange-500",
  },
  { name: "Execution Friction", icon: Radar, color: "text-rose-500" },
  { name: "Deep Research", icon: GitBranch, color: "text-cyan-500" },
  { name: "Synthesis", icon: BarChart3, color: "text-emerald-500" },
];

const AGENT_STEPS = [
  "parse.idea",
  "research.started",
  "research.progress",
  "execution.friction",
  "deep.research",
  "synthesis",
];

interface ResearchPipelineProgressProps {
  ideaId: string;
}

export function ResearchPipelineProgress({
  ideaId,
}: ResearchPipelineProgressProps) {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const { messages } = useRealtime({
    channel: ideaChannel({ ideaId }),
    topics: [
      "parse.idea",
      "research.started",
      "research.progress",
      "research.finished",
    ],
    token: () => fetchRealtimeSubscriptionToken(ideaId),
    enabled: !finished,
  });

  useEffect(() => {
    let intervalId: any;
    if (!finished && ideaId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/ideas/${ideaId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.status === "RESEARCHED") {
              setFinished(true);
              // Also mark all steps as complete for visual consistency
              setProgress({
                "parse.idea": "COMPLETED",
                "research.started": "COMPLETED",
                "research.progress": "COMPLETED",
                "execution.friction": "COMPLETED",
                "deep.research": "COMPLETED",
                synthesis: "COMPLETED",
              });
              clearInterval(intervalId);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ideaId, finished]);

  useEffect(() => {
    for (const msg of messages.delta) {
      if (msg.kind !== "data") continue;
      const data = msg.data as any;
      const topic = msg.topic;
      const status = data.status;

      if (topic === "research.finished" && data.success) {
        setFinished(true);
      }

      setProgress((prev) => ({ ...prev, [topic]: status }));
    }
  }, [messages.delta]);

  const completedCount = Object.keys(progress).filter(
    (k) =>
      progress[k] === "COMPLETE" ||
      progress[k] === "COMPLETED" ||
      progress[k] === "INITIATE",
  ).length;

  const progressPct = Math.min(
    (completedCount / AGENT_STEPS.length) * 100,
    100,
  );

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Analyzing Your Idea</h2>
        <p className="text-sm text-muted-foreground">
          Our AI agents are researching your idea across six dimensions.
        </p>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progressPct}%` }}
          className="h-full bg-primary rounded-full transition-all duration-500"
        />
      </div>

      <div className="space-y-2">
        {agents.map((agent, i) => {
          const stepKey =
            AGENT_STEPS[i] || agent.name.toLowerCase().replace(/\s+/g, ".");
          const status = progress[stepKey];
          const isActive =
            status &&
            status !== "COMPLETED" &&
            status !== "COMPLETE" &&
            status !== "INITIATE";
          const isDone =
            status === "COMPLETED" ||
            status === "COMPLETE" ||
            status === "INITIATE";
          const isFailed = status === "FAILED";

          return (
            <div
              key={agent.name}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary/20 bg-primary/5"
                  : isDone
                    ? "border-green-200 bg-green-50"
                    : "border-muted bg-background"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : isFailed ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <agent.icon className={`w-4 h-4 ${agent.color}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{agent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isDone
                    ? "Complete"
                    : isActive
                      ? "Running..."
                      : isFailed
                        ? "Failed"
                        : "Waiting"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {finished && (
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Research Complete
          </div>
          <Button asChild className="w-full">
            <Link href={`/ideas/${ideaId}`}>
              <Zap className="mr-2 h-4 w-4" />
              View Results
            </Link>
          </Button>
        </div>
      )}

      {!finished && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            This takes about 2-3 minutes. You can leave this screen — we&apos;ll
            email you when it&apos;s done.
          </p>
          <Button asChild variant="link" size="sm" className="mt-1">
            <Link href="/ideas">Go to My Ideas</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
