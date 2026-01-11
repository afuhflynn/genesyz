"use client";

import {
  useIdea,
  useRerunResearch,
  useArchiveIdea,
  useDeleteIdea,
  useExportIdeaPdf,
  useUnArchiveIdea,
} from "@/hooks";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Trash2,
  Archive,
  ArchiveRestore,
  MoreVertical,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { AssetTab } from "@/components/ideas/AssetTab";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchRealtimeSubscriptionToken } from "@/app/api/inngest/token/_actions/fetchRealtimeSubscriptionToken";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";

interface IResearchProgress {
  status: string;
  message: string;
  step?: string;
  id: string;
}

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [searchParams, setSearchParams] = useQueryStates(searchParamsSchema);

  const { data: idea, isLoading, error, refetch } = useIdea(id);
  const rerunResearch = useRerunResearch();
  const archiveIdea = useArchiveIdea();
  const unarchiveIdea = useUnArchiveIdea();
  const deleteIdea = useDeleteIdea();
  const exportPdf = useExportIdeaPdf();

  const [researchProgress, setResearchProgress] = useState<IResearchProgress[]>(
    []
  );

  // Fetch subscription token
  const { data: tokenData } = useQuery({
    queryKey: ["inngest-token", id],
    queryFn: async () => {
      const res = await fetch(`/api/inngest/token?ideaId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch token");
      return res.json() as Promise<{ token: string }>;
    },
    enabled:
      !!id && (idea?.status === "PROCESSING" || idea?.status === "PENDING"),
  });

  // Subscribe to real-time updates
  const {
    latestData,
    data,
    error: channelError,
    freshData,
    state,
  } = useInngestSubscription({
    refreshToken: async () =>
      await fetchRealtimeSubscriptionToken(id as string),
  });

  useEffect(() => {
    if (latestData) {
      const message = (latestData.data as any).message;
      const topic = latestData.topic;
      const status = (latestData.data as any).status;
      const eventId = (latestData.data as any).id;

      setResearchProgress((prev) => {
        const exists = prev.find((item) => item.step === topic);

        if (exists) {
          return prev.map((item) => {
            if (item.id === eventId) {
              return {
                ...item,
                message,
                status,
              };
            }

            return item;
          });
        } else {
          return [
            ...prev,
            {
              step: topic,
              message,
              status,
              id: eventId,
            },
          ];
        }
      });
    }
  }, [latestData, id, queryClient, refetch]);

  useEffect(() => {
    if (idea?.status === "RESEARCHED") {
      setResearchProgress([]);
    }
  }, [idea?.status]);

  if (isLoading) return <IdeaDetailSkeleton />;
  if (error || !idea) return <IdeaNotFound />;

  const isResearching =
    idea.status === "PROCESSING" || idea.status === "PENDING";
  const researchPackets = idea.researchPackets || [];

  // Helper to get specific packet content
  const getPacket = (type: string) =>
    researchPackets.find((p) => p.agentType === type)?.content as any;

  const interpreter = getPacket("INTERPRETER");
  const market = getPacket("MARKET_RESEARCH");
  const trends = getPacket("TREND_ANALYSIS");
  const execution = getPacket("EXECUTION_FRICTION");
  const synthesis = getPacket("SYNTHESIS");

  const score = idea.scores[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto ">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/ideas"
              className="hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ideas
            </Link>
            <span>/</span>
            <span>{idea.title || "Untitled Idea"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {idea.title || "Untitled Idea"}
          </h1>
          <div className="flex items-center gap-2">
            <Badge
              variant={getStatusVariant(idea.status)}
              className="capitalize"
            >
              {idea.status.toLowerCase().replace("_", " ")}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {formatRelativeTime(idea.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {idea.status === "RESEARCHED" && (
            <Button
              variant="outline"
              onClick={() => exportPdf.mutate(id)}
              disabled={exportPdf.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => rerunResearch.mutate(id)}
                disabled={isResearching}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Rerun Research
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (idea.isArchived) {
                    unarchiveIdea.mutate(id);
                  } else {
                    archiveIdea.mutate(id);
                  }
                }}
              >
                {idea.isArchived ? (
                  <>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm("Are you sure? This cannot be undone.")) {
                    deleteIdea.mutate(id, {
                      onSuccess: () => router.push("/ideas"),
                    });
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      {isResearching ? (
        <ResearchingState progress={researchProgress} />
      ) : (
        <Tabs
          value={searchParams.tab as string}
          onValueChange={(value) => setSearchParams({ tab: value })}
          defaultValue="overview"
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Score Cards */}
            {score && (
              <div className="grid gap-4 md:grid-cols-4">
                <ScoreCard
                  title="Overall"
                  score={score.overallScore as number}
                />
                <ScoreCard
                  title="Clarity"
                  score={score.clarityScore as number}
                />
                <ScoreCard title="Market" score={score.marketScore as number} />
                <ScoreCard
                  title="Execution"
                  score={score.executionScore as number}
                />
              </div>
            )}

            {/* Verdict */}
            {synthesis && (
              <Card
                className={cn(
                  "border-l-4",
                  getVerdictBorderColor(synthesis.verdict)
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Verdict:{" "}
                    <span className="capitalize">
                      {synthesis.verdict.replace(/-/g, " ")}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {synthesis.overallAssessment}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Key Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {synthesis.recommendations.map(
                          (rec: any, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Badge
                                variant="outline"
                                className={getPriorityColor(rec.priority)}
                              >
                                {rec.priority}
                              </Badge>
                              <span>{rec.action}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Problem
                  </h4>
                  <p>{interpreter?.problemStatement}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Solution
                  </h4>
                  <p>{interpreter?.proposedSolution}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Unique Value
                  </h4>
                  <p>{interpreter?.uniqueValue}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="grid gap-4 ">
              <Card>
                <CardHeader>
                  <CardTitle>Market Size</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        TAM
                      </p>
                      <p className="text-lg font-bold">
                        {market?.marketSize?.tam}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Growth
                      </p>
                      <p className="text-lg font-bold">
                        {market?.marketSize?.growthRate}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Trends
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {market?.marketTrends?.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timing & Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Timing Verdict
                    </p>
                    <p className="font-medium">
                      {trends?.timingAssessment?.verdict}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trends?.timingAssessment?.reasoning}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tech Readiness
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              (trends?.technologyReadiness?.score || 0) * 10
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold">
                        {trends?.technologyReadiness?.score}/10
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Competitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {market?.competitors?.map((comp: any, i: number) => (
                    <div
                      key={i}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <h4 className="font-semibold">{comp.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {comp.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 font-medium">
                            Strengths:
                          </span>{" "}
                          {comp.strengths?.join(", ")}
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">
                            Weaknesses:
                          </span>{" "}
                          {comp.weaknesses?.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Time to MVP
                    </p>
                    <p className="font-bold">
                      {execution?.resourceRequirements?.timeToMvp}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Team Size
                    </p>
                    <p className="font-bold">
                      {execution?.resourceRequirements?.teamSize}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Key Risks</h4>
                  <div className="space-y-2">
                    {execution?.riskFactors?.map((risk: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-secondary/10 rounded-lg"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{risk.risk}</p>
                          <p className="text-xs text-muted-foreground">
                            Mitigation: {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <AssetTab ideaId={id} inputs={idea.inputs} />
          </TabsContent>

          <TabsContent value="raw">
            <Card className="w-full!">
              <CardHeader>
                <CardTitle>Raw Agent Outputs</CardTitle>
                <CardDescription>
                  Direct JSON output from the research agents
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full!">
                <Accordion type="single" collapsible className="w-full">
                  {researchPackets.map((packet) => (
                    <AccordionItem key={packet.id} value={packet.id}>
                      <AccordionTrigger className="font-mono text-sm">
                        {packet.agentType}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ScrollArea className="h-100 w-full rounded-md border p-4">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(packet.content, null, 2)}
                          </pre>
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ScoreCard({ title, score }: { title: string; score: number }) {
  let colorClass = "text-red-500";
  if (score >= 80) colorClass = "text-green-500";
  else if (score >= 50) colorClass = "text-amber-500";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", colorClass)}>{score}</div>
      </CardContent>
    </Card>
  );
}

function ResearchingState({ progress }: { progress: IResearchProgress[] }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative bg-background p-4 rounded-full border shadow-lg">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Analyzing your idea...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Our AI agents are currently researching market size, competitors, and
          execution risks. This usually takes about 1-2 minutes.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {progress.map((item, index) => (
          <div
            className="flex items-center gap-3 text-sm"
            key={`${index}-${item.id}`}
          >
            {item.status === "FAILED" ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : item.status === "COMPLETED" ||
              item.status === "INITIATE" ||
              item.status === "PROCESSING" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-muted" />
            )}
            <span>{item?.message || "No message"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdeaDetailSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
      </div>
      <Skeleton className="h-[500px]" />
    </div>
  );
}

function IdeaNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold">Idea not found</h2>
      <p className="text-muted-foreground mb-6">
        The idea you're looking for doesn't exist or you don't have permission
        to view it.
      </p>
      <Button asChild>
        <Link href="/ideas">Back to Ideas</Link>
      </Button>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case "RESEARCHED":
      return "default";
    case "PROCESSING":
      return "secondary";
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}

function getVerdictBorderColor(verdict: string) {
  switch (verdict) {
    case "pursue-immediately":
      return "border-l-green-500";
    case "pursue-with-modifications":
      return "border-l-blue-500";
    case "needs-more-research":
      return "border-l-amber-500";
    case "pivot-needed":
      return "border-l-orange-500";
    case "not-recommended":
      return "border-l-red-500";
    default:
      return "border-l-border";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case "medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    default:
      return "";
  }
}
