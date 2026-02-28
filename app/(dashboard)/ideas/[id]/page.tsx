"use client";

import { useInngestSubscription } from "@inngest/realtime/hooks";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  Edit,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchRealtimeSubscriptionToken } from "@/app/api/inngest/token/_actions/fetchRealtimeSubscriptionToken";
import { GuideChat } from "@/components/guide";
import { IdeaDetailSkeleton } from "@/components/idea/idea-detail-skeleton";
import { IdeaNotFound } from "@/components/idea/idea-notfound";
import { ResearchingState } from "@/components/idea/research-state";
import { ScoreCard } from "@/components/idea/score-card";
import {
  getPriorityColor,
  getStatusVariant,
  getVerdictBorderColor,
} from "@/components/idea/utils";
import { ArchiveIdeaDialog } from "@/components/ideas/[id]/ArchiveIdeaDialog";
import { ConvertToStartupCTA } from "@/components/ideas/[id]/ConvertToStartupCTA";
import { DeleteIdeaDialog } from "@/components/ideas/[id]/DeleteIdea";
import { EditIdeaDialog } from "@/components/ideas/[id]/EditIdea";
import { UnarchiveIdeaDialog } from "@/components/ideas/[id]/UnarchiveIdeaDialog";
import { AssetTab } from "@/components/ideas/AssetTab";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useExportIdeaPdf,
  useIdea,
  useIdeaStartup,
  useRerunResearch,
} from "@/hooks";
import { cn, formatRelativeTime } from "@/lib/utils";
import { searchParamsSchema } from "@/nuqs";

export default function IdeaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [searchParams, setSearchParams] = useQueryStates(searchParamsSchema);

  const { data: idea, isLoading, error } = useIdea(id);
  const { data: startupData } = useIdeaStartup(id);
  const rerunResearch = useRerunResearch();
  const exportPdf = useExportIdeaPdf();

  const [researchProgress, setResearchProgress] = useState<IResearchProgress[]>(
    [],
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPacketId, setCopiedPacketId] = useState<string | null>(null);

  useEffect(() => {
    if (idea) {
      console.log({ idea });
    }
  }, [idea]);

  // Subscribe to real-time updates
  const { latestData } = useInngestSubscription({
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
  }, [latestData]);

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
  const preferredMarket =
    market?.marketSize?.regional ?? market?.marketSize?.global;
  const tam = preferredMarket?.tam;
  const sam = preferredMarket?.sam;
  const som = preferredMarket?.som;

  const score = idea.scores[0];

  return (
    <div className="space-y-8  ">
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
              <DropdownMenuItem asChild>
                {idea.isArchived ? (
                  <UnarchiveIdeaDialog id={id} title={idea.title} />
                ) : (
                  <ArchiveIdeaDialog id={id} title={idea.title} />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DeleteIdeaDialog id={id} redirect={"/ideas"} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      {isResearching ? (
        <ResearchingState progress={researchProgress} />
      ) : (
        <>
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
                  <ScoreCard
                    title="Market"
                    score={score.marketScore as number}
                  />
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
                    getVerdictBorderColor(synthesis.verdict),
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
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Convert to Startup CTA */}
              {idea.status === "RESEARCHED" && (
                <ConvertToStartupCTA
                  startUpSlug={startupData?.startup?.slug as string}
                  ideaId={id}
                  ideaTitle={idea.title}
                  ideaSummary={idea.summary}
                  hasExistingStartup={startupData?.hasStartup ?? false}
                />
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

              {/* Original Prompt */}
              {idea.originalPrompt && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Original Prompt</CardTitle>
                      <CardDescription>
                        What you submitted when creating this idea
                      </CardDescription>
                    </div>
                    <EditIdeaDialog
                      id={idea.id}
                      title={idea.title}
                      summary={idea.summary}
                      originalPrompt={idea.originalPrompt}
                      archived={idea.isArchived}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="whitespace-pre-wrap text-sm">
                        {idea.originalPrompt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid gap-4 ">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Size</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          TAM
                        </p>
                        <p className="text-lg font-bold">
                          {tam?.usdValue || tam?.value || "N/A"}
                        </p>
                        {tam?.value && tam?.value !== tam?.usdValue ? (
                          <p className="text-xs text-muted-foreground">
                            {tam.value} {tam.currency || ""}
                          </p>
                        ) : null}
                        {tam?.isEstimated && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Estimated
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          SAM
                        </p>
                        <p className="text-lg font-bold">
                          {sam?.usdValue || sam?.value || "N/A"}
                        </p>
                        {sam?.value && sam?.value !== sam?.usdValue ? (
                          <p className="text-xs text-muted-foreground">
                            {sam.value} {sam.currency || ""}
                          </p>
                        ) : null}
                        {sam?.isEstimated && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Estimated
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          SOM
                        </p>
                        <p className="text-lg font-bold">
                          {som?.usdValue || som?.value || "N/A"}
                        </p>
                        {som?.value && som?.value !== som?.usdValue ? (
                          <p className="text-xs text-muted-foreground">
                            {som.value} {som.currency || ""}
                          </p>
                        ) : null}
                        {som?.isEstimated && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Estimated
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <p className="text-sm font-medium text-muted-foreground">
                        Growth:
                      </p>
                      <p className="text-sm font-medium">
                        {market?.marketSize?.regional?.growthRate?.value ||
                          market?.marketSize?.global?.growthRate?.value ||
                          market?.marketSize?.growthRate?.value ||
                          "N/A"}
                      </p>
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

                {(market?.marketSize?.regional?.marketCap ||
                  market?.marketSize?.global?.marketCap) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Capitalization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Industry
                          </p>
                          <p className="text-lg font-bold">
                            {market?.marketSize?.regional?.marketCap
                              ?.industryMarketCap?.usdValue ||
                              market?.marketSize?.global?.marketCap
                                ?.industryMarketCap?.usdValue ||
                              "N/A"}
                          </p>
                          {(market?.marketSize?.regional?.marketCap
                            ?.industryMarketCap?.isEstimated ||
                            market?.marketSize?.global?.marketCap
                              ?.industryMarketCap?.isEstimated) && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Estimated
                            </Badge>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Global
                          </p>
                          <p className="text-lg font-bold">
                            {market?.marketSize?.regional?.marketCap
                              ?.globalMarketCap?.usdValue ||
                              market?.marketSize?.global?.marketCap
                                ?.globalMarketCap?.usdValue ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Potential Valuation
                          </p>
                          <p className="text-lg font-bold">
                            {market?.marketSize?.regional?.marketCap
                              ?.potentialStartupValuation?.usdValue ||
                              market?.marketSize?.global?.marketCap
                                ?.potentialStartupValuation?.usdValue ||
                              "N/A"}
                          </p>
                          {(market?.marketSize?.regional?.marketCap
                            ?.potentialStartupValuation?.isEstimated ||
                            market?.marketSize?.global?.marketCap
                              ?.potentialStartupValuation?.isEstimated) && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Estimated
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Raw Agent Outputs</CardTitle>
                      <CardDescription>
                        Direct JSON output from the research agents
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const rawData = JSON.stringify(
                          researchPackets.map((p) => ({
                            agentType: p.agentType,
                            content: p.content,
                          })),
                          null,
                          2,
                        );
                        navigator.clipboard.writeText(rawData);
                        toast.success("Copied to clipboard", {
                          description: "Raw agent outputs copied successfully",
                        });
                        setCopiedAll(true);
                        setTimeout(() => setCopiedAll(false), 2000);
                      }}
                    >
                      {copiedAll ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy All
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="w-full!">
                  <Accordion type="single" collapsible className="w-full">
                    {researchPackets.map((packet) => (
                      <AccordionItem key={packet.id} value={packet.id}>
                        <div className="relative">
                          <AccordionTrigger className="pr-12 font-mono text-sm flex-row-reverse justify-end gap-2">
                            <span>{packet.agentType}</span>
                          </AccordionTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-10 h-8 w-8 -translate-y-1/2"
                            onClick={() => {
                              const content = JSON.stringify(
                                packet.content,
                                null,
                                2,
                              );
                              navigator.clipboard.writeText(content);
                              toast.success("Copied to clipboard", {
                                description: `${packet.agentType} data copied`,
                              });
                              setCopiedPacketId(packet.id);
                              setTimeout(() => setCopiedPacketId(null), 2000);
                            }}
                          >
                            {copiedPacketId === packet.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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

          {/* <GuideChat ideaId={id} /> */}
        </>
      )}
    </div>
  );
}
