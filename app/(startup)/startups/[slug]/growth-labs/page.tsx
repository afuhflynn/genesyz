"use client";

import {
  Activity,
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  ClipboardList,
  FolderOpen,
  Loader2,
  MessageSquare,
  RotateCcw,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateGrowthExperimentTasks,
  useSuggestGrowthExperimentTasks,
  useUpdateGrowthExperiment,
} from "@/hooks";
import {
  FUNNEL_STAGE_LABELS,
  FUNNEL_STAGES,
  GROWTH_CHANNELS,
  type FunnelStage,
} from "@/lib/growth/constants";

type TaskSuggestionDraft = {
  title: string;
  description: string;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueInDays: number | null;
  phase: string;
  selected: boolean;
  listId: string;
  assigneeIds: string[];
  milestoneId: string;
};

export default function GrowthLabsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [startupId, setStartupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // GrowthOS data states
  const [personas, setPersonas] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [eventSummary, setEventSummary] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);
  const [channelPerformance, setChannelPerformance] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [startupMembers, setStartupMembers] = useState<any[]>([]);
  const [taskMilestones, setTaskMilestones] = useState<any[]>([]);
  const [taskLabels, setTaskLabels] = useState<any[]>([]);

  // Action loading states
  const [generatingPersona, setGeneratingPersona] = useState(false);
  const [analyzingCopy, setAnalyzingCopy] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [creatingExperiment, setCreatingExperiment] = useState(false);
  const suggestTasks = useSuggestGrowthExperimentTasks();
  const createExperimentTasks = useCreateGrowthExperimentTasks();
  const updateExperiment = useUpdateGrowthExperiment();

  // Form states - Persona
  const [newPersona, setNewPersona] = useState({
    name: "",
    avatar: "💡",
    description: "",
    painPoints: "",
    channels: "",
    psychographics: "",
  });

  // Form states - Copywriting grade analyzer
  const [copyText, setCopyText] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Form states - Campaign
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    channel: "",
    budget: "",
    objective: "",
    personaIds: [] as string[],
  });

  // Form states - Experiment
  const [newExperiment, setNewExperiment] = useState({
    campaignId: "standalone",
    title: "",
    hypothesis: "",
    metrics: "",
  });

  const [newEvent, setNewEvent] = useState({
    eventName: "",
    stage: "AWARENESS" as FunnelStage,
    count: "1",
    value: "",
    channel: "",
    campaignId: "standalone",
    experimentId: "standalone",
    personaId: "standalone",
    periodStart: "",
    periodEnd: "",
    notes: "",
  });

  // Selected Experiment to log results
  const [activeExperiment, setActiveExperiment] = useState<any>(null);
  const [taskPlanExperiment, setTaskPlanExperiment] = useState<any>(null);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestionDraft[]>(
    [],
  );
  const [expLog, setExpLog] = useState({
    results: "",
    conclusion: "SUCCESS",
    status: "CONCLUDED",
    learnings: "",
  });

  // Fetch startup metadata to resolve ID
  useEffect(() => {
    async function fetchStartup() {
      try {
        const res = await fetch(`/api/startups/${slug}`);
        const data = await res.json();
        const startup = data.data ?? data;
        if (startup?.id) {
          setStartupId(startup.id);
        }
      } catch (err) {
        console.error("Failed to load startup details", err);
      }
    }
    fetchStartup();
  }, [slug]);

  // Load all GrowthOS elements (Personas, Campaigns, Experiments)
  useEffect(() => {
    if (!startupId) return;

    async function loadGrowthData() {
      try {
        const [
          personasRes,
          expRes,
          eventsRes,
          tasksRes,
          membersRes,
          milestonesRes,
          labelsRes,
        ] = await Promise.all([
          fetch(`/api/startups/${startupId}/growth/personas`),
          fetch(`/api/startups/${startupId}/growth/experiments`),
          fetch(`/api/startups/${startupId}/growth/events`),
          fetch(`/api/startups/${startupId}/tasks`),
          fetch(`/api/startups/${startupId}/members`),
          fetch(`/api/startups/${startupId}/task-milestones`),
          fetch(`/api/startups/${startupId}/task-labels`),
        ]);

        const personasData = await personasRes.json();
        const expData = await expRes.json();
        const eventsData = await eventsRes.json();
        const tasksData = await tasksRes.json();
        const membersData = await membersRes.json();
        const milestonesData = await milestonesRes.json();
        const labelsData = await labelsRes.json();

        if (personasData.data) setPersonas(personasData.data);
        if (expData.data) {
          setCampaigns(expData.data.campaigns || []);
          setExperiments(expData.data.experiments || []);
        }
        if (eventsData.data?.summary) setEventSummary(eventsData.data.summary);
        if (eventsData.data?.funnel) setFunnel(eventsData.data.funnel);
        if (eventsData.data?.channelPerformance)
          setChannelPerformance(eventsData.data.channelPerformance);
        if (tasksData.data?.lists) setTaskLists(tasksData.data.lists);
        if (membersData.data) setStartupMembers(membersData.data);
        if (milestonesData.data) setTaskMilestones(milestonesData.data);
        if (labelsData.data) setTaskLabels(labelsData.data);
      } catch (err) {
        console.error("Failed to load GrowthOS data", err);
      } finally {
        setLoading(false);
      }
    }
    loadGrowthData();
  }, [startupId]);

  const handleLogEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!startupId || !newEvent.eventName.trim()) {
      toast.error("Add an event name first.");
      return;
    }
    setSavingEvent(true);
    try {
      const response = await fetch(`/api/startups/${startupId}/growth/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: newEvent.eventName,
          stage: newEvent.stage,
          count: Number(newEvent.count) || 1,
          value: newEvent.value ? Number(newEvent.value) : undefined,
          channel: newEvent.channel || undefined,
          source: newEvent.channel || undefined,
          campaignId:
            newEvent.campaignId === "standalone"
              ? undefined
              : newEvent.campaignId,
          experimentId:
            newEvent.experimentId === "standalone"
              ? undefined
              : newEvent.experimentId,
          personaId:
            newEvent.personaId === "standalone"
              ? undefined
              : newEvent.personaId,
          periodStart: newEvent.periodStart
            ? new Date(newEvent.periodStart).toISOString()
            : undefined,
          periodEnd: newEvent.periodEnd
            ? new Date(newEvent.periodEnd).toISOString()
            : undefined,
          notes: newEvent.notes || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save result");
      setNewEvent({
        eventName: "",
        stage: "AWARENESS",
        count: "1",
        value: "",
        channel: "",
        campaignId: "standalone",
        experimentId: "standalone",
        personaId: "standalone",
        periodStart: "",
        periodEnd: "",
        notes: "",
      });
      const refreshed = await fetch(
        `/api/startups/${startupId}/growth/events`,
      ).then((res) => res.json());
      setEventSummary(refreshed.data?.summary || []);
      setFunnel(refreshed.data?.funnel || null);
      setChannelPerformance(refreshed.data?.channelPerformance || []);
      toast.success("Growth evidence logged.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save result",
      );
    } finally {
      setSavingEvent(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!startupId) return;
    setLoadingInsights(true);
    try {
      const response = await fetch(
        `/api/startups/${startupId}/growth/insights`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to generate insights");
      setInsights(data.data);
      toast.success("GrowthOS found new opportunities.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to generate insights",
      );
    } finally {
      setLoadingInsights(false);
    }
  };

  // Create persona manually
  const handleAddPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId) return;
    if (!newPersona.name || !newPersona.description) {
      toast.error("Please fill in name and description.");
      return;
    }

    try {
      const res = await fetch(`/api/startups/${startupId}/growth/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPersona.name,
          avatar: newPersona.avatar,
          description: newPersona.description,
          painPoints: newPersona.painPoints
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          channels: newPersona.channels
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          psychographics: newPersona.psychographics,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setPersonas([data.data, ...personas]);
        setNewPersona({
          name: "",
          avatar: "💡",
          description: "",
          painPoints: "",
          channels: "",
          psychographics: "",
        });
        toast.success("Persona added successfully!");
      }
    } catch (_err) {
      toast.error("Failed to save persona.");
    }
  };

  const handleGenerateTaskPlan = async (experiment: any) => {
    if (!startupId) return;
    if (taskLists.length === 0) {
      toast.error("Create a task list before generating experiment tasks.");
      return;
    }
    setTaskPlanExperiment(experiment);
    try {
      const response = await suggestTasks.mutateAsync({
        startupId,
        experimentId: experiment.id,
      });
      setTaskSuggestions(
        response.data.suggestions.map((suggestion) => ({
          ...suggestion,
          selected: true,
          listId: taskLists[0].id,
          assigneeIds: [],
          milestoneId: "none",
        })),
      );
    } catch (_error) {
      setTaskPlanExperiment(null);
    }
  };

  const handleStartExperiment = async (experiment: any) => {
    if (!startupId) return;
    try {
      const response = await updateExperiment.mutateAsync({
        startupId,
        experimentId: experiment.id,
        data: { status: "RUNNING" },
      });
      setExperiments((current) =>
        current.map((item) =>
          item.id === experiment.id ? response.data : item,
        ),
      );
      toast.success("Experiment started.");
    } catch (_error) {
      // Mutation toast already explains the failure.
    }
  };

  const handleCreateTaskPlan = async () => {
    if (!startupId || !taskPlanExperiment) return;
    const selected = taskSuggestions.filter(
      (suggestion) => suggestion.selected,
    );
    if (!selected.length) {
      toast.error("Select at least one task.");
      return;
    }
    try {
      await createExperimentTasks.mutateAsync({
        startupId,
        experimentId: taskPlanExperiment.id,
        data: {
          tasks: selected.map((suggestion) => ({
            listId: suggestion.listId,
            title: suggestion.title,
            description: `${suggestion.description}\n\nExecution phase: ${suggestion.phase}`,
            priority: suggestion.priority,
            deadline:
              suggestion.dueInDays === null
                ? null
                : new Date(
                    Date.now() + suggestion.dueInDays * 86400000,
                  ).toISOString(),
            assigneeIds: suggestion.assigneeIds,
            labelIds: [],
            milestoneId:
              suggestion.milestoneId === "none" ? null : suggestion.milestoneId,
          })),
        },
      });
      setExperiments((current) =>
        current.map((experiment) =>
          experiment.id === taskPlanExperiment.id
            ? {
                ...experiment,
                progress: {
                  ...(experiment.progress || {}),
                  total: (experiment.progress?.total || 0) + selected.length,
                },
              }
            : experiment,
        ),
      );
      setTaskSuggestions([]);
      setTaskPlanExperiment(null);
    } catch (_error) {
      // Mutation toast already explains the failure.
    }
  };

  // Generate Persona using AI
  const handleGenerateAIPersona = async () => {
    if (!startupId) return;
    setGeneratingPersona(true);
    toast.info("AI is modeling your target customer personas... 🧠");

    try {
      const res = await fetch(`/api/startups/${startupId}/growth/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_ai" }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setPersonas([data.data, ...personas]);
        toast.success("AI generated new persona outline!");
      } else {
        throw new Error(data.error || "Failed to generate");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI Persona.");
    } finally {
      setGeneratingPersona(false);
    }
  };

  // Grade Marketing Copy
  const handleAnalyzeCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId) return;
    if (!copyText.trim()) {
      toast.error("Please enter copywriting text first.");
      return;
    }

    setAnalyzingCopy(true);
    setAnalysisResults(null);

    try {
      const res = await fetch(`/api/startups/${startupId}/growth/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          copyText,
          personaId: selectedPersonaId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setAnalysisResults(data.data);
        toast.success("Copywriting graded successfully!");
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze copywriting.");
    } finally {
      setAnalyzingCopy(false);
    }
  };

  // Create Campaign
  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId) return;
    if (!newCampaign.name || !newCampaign.channel) {
      toast.error("Name and channel are required.");
      return;
    }

    setCreatingCampaign(true);

    try {
      const res = await fetch(`/api/startups/${startupId}/growth/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaign.name,
          channel: newCampaign.channel,
          budget: parseFloat(newCampaign.budget) || 0,
          objective: newCampaign.objective,
          personaIds: newCampaign.personaIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setCampaigns([data.data, ...campaigns]);
        setNewCampaign({
          name: "",
          channel: "",
          budget: "",
          objective: "",
          personaIds: [],
        });
        toast.success("Campaign launched!");
      }
    } catch (_err) {
      toast.error("Failed to add campaign.");
    } finally {
      setCreatingCampaign(false);
    }
  };

  // Create Experiment
  const handleAddExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId) return;
    if (
      !newExperiment.title ||
      !newExperiment.hypothesis ||
      !newExperiment.metrics
    ) {
      toast.error("Please fill in experiment parameters.");
      return;
    }

    setCreatingExperiment(true);

    try {
      const res = await fetch(`/api/startups/${startupId}/growth/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "experiment",
          title: newExperiment.title,
          hypothesis: newExperiment.hypothesis,
          metrics: newExperiment.metrics,
          campaignId:
            newExperiment.campaignId === "standalone"
              ? null
              : newExperiment.campaignId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setExperiments([data.data, ...experiments]);
        setNewExperiment({
          campaignId: "standalone",
          title: "",
          hypothesis: "",
          metrics: "",
        });
        toast.success("Experiment added to dashboard!");
      }
    } catch (_err) {
      toast.error("Failed to save experiment.");
    } finally {
      setCreatingExperiment(false);
    }
  };

  // Log Experiment Outcomes
  const handleConcludeExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId || !activeExperiment) return;

    try {
      const res = await fetch(
        `/api/startups/${startupId}/growth/experiments/${activeExperiment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            results: expLog.results,
            conclusion: expLog.conclusion,
            status: expLog.status,
            learnings: expLog.learnings,
          }),
        },
      );

      const data = await res.json();
      if (res.ok && data.data) {
        setExperiments(
          experiments.map((exp) => (exp.id === data.data.id ? data.data : exp)),
        );
        setActiveExperiment(null);
        setExpLog({
          results: "",
          conclusion: "SUCCESS",
          status: "CONCLUDED",
          learnings: "",
        });
        toast.success("Experiment logged and concluded!");
      }
    } catch (_err) {
      toast.error("Failed to save logs.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button disabled variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/startups/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Growth Labs (GrowthOS)
          </h1>
        </div>
      </div>

      {/* GrowthOS Header Metric Card */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-primary/5 to-cyan-500/10 border-primary/20">
        <CardContent className="py-6 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>AI Growth Operating System</span>
            </div>
            <h2 className="text-xl font-bold">Growth Labs Workspace</h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Model target customer personas, grade your marketing copy
              alignment using diagnostics, and run structured A/B growth
              experiments to discover channels.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-background/50 border border-border/80 p-3 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-extrabold text-foreground">
                {personas.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Personas
              </div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <div className="text-sm font-extrabold text-foreground">
                {campaigns.length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Campaigns
              </div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <div className="text-sm font-extrabold text-foreground">
                {experiments.filter((e) => e.status === "RUNNING").length}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Active Exp
              </div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <div className="text-sm font-extrabold text-foreground">
                {eventSummary.reduce((total, item) => total + item.count, 0)}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Signals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {eventSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Evidence signals</CardTitle>
            <CardDescription className="text-xs">
              Recent manual funnel events grouped by outcome.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {eventSummary.map((item) => (
              <Badge key={item.eventName} variant="outline">
                {item.eventName}: {item.count}
                {item.value ? ` · ${item.value}` : ""}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">AARRR conversion funnel</CardTitle>
            <CardDescription className="text-xs">
              Turn weekly exports, interviews, and campaign reports into
              comparable growth evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              {FUNNEL_STAGES.map((stage) => {
                const metric = funnel?.stages?.find(
                  (item: any) => item.stage === stage,
                );
                return (
                  <div
                    key={stage}
                    className={`rounded-lg border p-3 ${metric?.warning ? "border-amber-300 bg-amber-50/50" : "bg-muted/20"}`}
                  >
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {FUNNEL_STAGE_LABELS[stage]}
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {metric?.count ?? 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {metric?.conversionRate === null ||
                      metric?.conversionRate === undefined
                        ? "Entry stage"
                        : `${metric.conversionRate}% from prior`}
                    </p>
                  </div>
                );
              })}
            </div>
            {(funnel?.warnings?.length ?? 0) > 0 && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                {funnel.warnings.join(" ")}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">GrowthOS diagnosis</CardTitle>
            <CardDescription className="text-xs">
              Grounded in your current evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateInsights}
              disabled={loadingInsights}
              className="w-full text-xs"
            >
              {loadingInsights
                ? "Analyzing evidence..."
                : "Analyze growth loop"}
            </Button>
            {insights?.summary && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {insights.summary}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Log manual result</CardTitle>
          <CardDescription className="text-xs">
            Add an aggregated observation from an ad platform, spreadsheet,
            interview batch, or experiment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogEvent} className="grid gap-3 md:grid-cols-4">
            <Input
              value={newEvent.eventName}
              onChange={(e) =>
                setNewEvent({ ...newEvent, eventName: e.target.value })
              }
              placeholder="e.g. Qualified leads"
              className="h-9 text-xs"
            />
            <Select
              value={newEvent.stage}
              onValueChange={(value) =>
                setNewEvent({ ...newEvent, stage: value as FunnelStage })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUNNEL_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {FUNNEL_STAGE_LABELS[stage]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={newEvent.count}
              onChange={(e) =>
                setNewEvent({ ...newEvent, count: e.target.value })
              }
              placeholder="Count"
              className="h-9 text-xs"
            />
            <Select
              value={newEvent.channel || "unselected"}
              onValueChange={(value) =>
                setNewEvent({
                  ...newEvent,
                  channel: value === "unselected" ? "" : value,
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unselected">Unattributed</SelectItem>
                {GROWTH_CHANNELS.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newEvent.campaignId}
              onValueChange={(value) =>
                setNewEvent({ ...newEvent, campaignId: value })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standalone">No campaign</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newEvent.experimentId}
              onValueChange={(value) =>
                setNewEvent({ ...newEvent, experimentId: value })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standalone">No experiment</SelectItem>
                {experiments.map((experiment) => (
                  <SelectItem key={experiment.id} value={experiment.id}>
                    {experiment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newEvent.value}
              onChange={(e) =>
                setNewEvent({ ...newEvent, value: e.target.value })
              }
              placeholder="Value (optional)"
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              disabled={savingEvent}
              className="h-9 text-xs"
            >
              {savingEvent ? "Saving..." : "Log evidence"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {insights?.findings?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Prioritized opportunities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {insights.findings.map((finding: any, index: number) => (
              <div
                key={`${finding.title}-${index}`}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{finding.title}</p>
                  <Badge variant="outline" className="text-[9px]">
                    {finding.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {finding.evidence}
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-semibold">Next:</span> {finding.action}
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Experiment: {finding.nextExperiment}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="personas" className="space-y-6">
        <TabsList className="bg-muted/50 border">
          <TabsTrigger value="personas" className="text-xs">
            Customer Personas
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="text-xs">
            Message Analyzer
          </TabsTrigger>
          <TabsTrigger value="experiments" className="text-xs">
            Experiments Lab
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Customer Personas */}
        <TabsContent value="personas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">
                    Add Target Persona
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define details or click below to let AI model a persona
                    profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleGenerateAIPersona}
                    disabled={generatingPersona}
                    className="w-full gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    variant="outline"
                  >
                    {generatingPersona ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>AI Modeling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Generate AI Persona</span>
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-extrabold text-muted-foreground">
                      <span className="bg-background px-2">Or Manual</span>
                    </div>
                  </div>

                  <form onSubmit={handleAddPersona} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={newPersona.name}
                        onChange={(e) =>
                          setNewPersona({ ...newPersona, name: e.target.value })
                        }
                        placeholder="e.g. Agency Alice"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role Emoji</Label>
                      <Input
                        value={newPersona.avatar}
                        onChange={(e) =>
                          setNewPersona({
                            ...newPersona,
                            avatar: e.target.value,
                          })
                        }
                        placeholder="e.g. 🏢"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Bio / Description</Label>
                      <Textarea
                        value={newPersona.description}
                        onChange={(e) =>
                          setNewPersona({
                            ...newPersona,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief summary of their profile..."
                        className="min-h-[60px] text-xs bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Pain Points (comma-separated)
                      </Label>
                      <Input
                        value={newPersona.painPoints}
                        onChange={(e) =>
                          setNewPersona({
                            ...newPersona,
                            painPoints: e.target.value,
                          })
                        }
                        placeholder="Cost, Lack of visibility, delays"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Active Channels (comma-separated)
                      </Label>
                      <Input
                        value={newPersona.channels}
                        onChange={(e) =>
                          setNewPersona({
                            ...newPersona,
                            channels: e.target.value,
                          })
                        }
                        placeholder="LinkedIn, WhatsApp"
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full text-xs">
                      Create Persona
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              {personas.length === 0 ? (
                <Card className="border-dashed h-full flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  <User className="w-12 h-12 text-muted-foreground/30 mb-3 animate-pulse" />
                  <h3 className="text-sm font-semibold">
                    No Target Personas Defined
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Generate an AI persona above to instantly model standard
                    customer groups based on your startup description.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personas.map((persona) => (
                    <Card
                      key={persona.id}
                      className="border border-border/80 shadow-sm"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{persona.avatar}</span>
                            <div>
                              <CardTitle className="text-sm font-bold">
                                {persona.name}
                              </CardTitle>
                              <CardDescription className="text-[10px]">
                                Target Score: {persona.score}/100
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {persona.description}
                        </p>

                        <div className="space-y-1">
                          <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground">
                            Pain Points
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(persona.painPoints) &&
                              persona.painPoints.map((pt: string) => (
                                <Badge
                                  key={pt}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {pt}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground">
                            Acquisition Channels
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(persona.channels) &&
                              persona.channels.map((ch: string) => (
                                <Badge
                                  key={ch}
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {ch}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        {persona.psychographics && (
                          <div className="space-y-1">
                            <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground">
                              Psychographics
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-normal italic">
                              {persona.psychographics}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Copywriting Analyzer */}
        <TabsContent value="analyzer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">
                    Marketing Copy Analyzer
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Grade readability, value proposition, and CTA hooks against
                    customer profiles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleAnalyzeCopy} className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Select Target Customer Persona
                      </Label>
                      <Select
                        value={selectedPersonaId}
                        onValueChange={setSelectedPersonaId}
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue placeholder="Select target profile (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {personas.map((p) => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              className="text-xs"
                            >
                              {p.avatar} {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        Copywriting Text (Email, Ad Body, Headline)
                      </Label>
                      <Textarea
                        value={copyText}
                        onChange={(e) => setCopyText(e.target.value)}
                        placeholder="Write or paste your copywriting draft here..."
                        className="min-h-[160px] text-xs bg-background leading-relaxed"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={analyzingCopy}
                      className="w-full text-xs"
                    >
                      {analyzingCopy ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Diagnostics Grading...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Grade Copy Alignment</span>
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7">
              {analysisResults ? (
                <Card className="border border-border/80 shadow-sm h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span>AI Copy Diagnostics Report</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Score calculations and loop hole corrections for
                      conversions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 bg-muted/20 border p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Clarity
                        </div>
                        <div className="text-2xl font-black text-foreground">
                          {analysisResults.clarityScore}%
                        </div>
                        <Progress
                          value={analysisResults.clarityScore}
                          className="h-1.5 mt-2 bg-muted"
                        />
                      </div>

                      <div className="space-y-1 bg-muted/20 border p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Emotional Hook
                        </div>
                        <div className="text-2xl font-black text-foreground">
                          {analysisResults.emotionScore}%
                        </div>
                        <Progress
                          value={analysisResults.emotionScore}
                          className="h-1.5 mt-2 bg-muted"
                        />
                      </div>

                      <div className="space-y-1 bg-muted/20 border p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          CTA Strength
                        </div>
                        <div className="text-2xl font-black text-foreground">
                          {analysisResults.ctaScore}%
                        </div>
                        <Progress
                          value={analysisResults.ctaScore}
                          className="h-1.5 mt-2 bg-muted"
                        />
                      </div>

                      <div className="space-y-1 bg-muted/20 border p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Target Alignment
                        </div>
                        <div className="text-2xl font-black text-foreground">
                          {analysisResults.alignmentScore}%
                        </div>
                        <Progress
                          value={analysisResults.alignmentScore}
                          className="h-1.5 mt-2 bg-muted"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-destructive uppercase tracking-wider">
                        Leaking Loop Holes
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                        {analysisResults.loopholes?.map((loop: string) => (
                          <li key={loop} className="leading-relaxed">
                            {loop}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                        Optimization Suggestions
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                        {analysisResults.suggestions?.map((sug: string) => (
                          <li key={sug} className="leading-relaxed">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed h-full flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3 animate-pulse" />
                  <h3 className="text-sm font-semibold">
                    No Diagnostics Report Generated
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Enter copy text on the left, select a target persona, and
                    trigger alignment grading to find conversion loopholes.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Experiments Lab */}
        <TabsContent value="experiments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-4">
              {/* Add Campaign Card */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-bold">
                    Launch Marketing Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <form onSubmit={handleAddCampaign} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Campaign Name</Label>
                      <Input
                        value={newCampaign.name}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g. Q3 cold outreach"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Primary Channel</Label>
                      <Select
                        value={newCampaign.channel || "unselected"}
                        onValueChange={(value) =>
                          setNewCampaign({
                            ...newCampaign,
                            channel: value === "unselected" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Choose a channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unselected">
                            Choose a channel
                          </SelectItem>
                          {GROWTH_CHANNELS.map((channel) => (
                            <SelectItem key={channel} value={channel}>
                              {channel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Objective</Label>
                      <Input
                        value={newCampaign.objective}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            objective: e.target.value,
                          })
                        }
                        placeholder="e.g. Generate 30 qualified leads"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Target Personas</Label>
                      <div className="max-h-20 space-y-1 overflow-y-auto rounded border p-2">
                        {personas.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground">
                            Create a persona first.
                          </p>
                        ) : (
                          personas.map((persona) => (
                            <label
                              key={persona.id}
                              className="flex items-center gap-2 text-[10px]"
                            >
                              <input
                                type="checkbox"
                                checked={newCampaign.personaIds.includes(
                                  persona.id,
                                )}
                                onChange={(e) =>
                                  setNewCampaign({
                                    ...newCampaign,
                                    personaIds: e.target.checked
                                      ? [...newCampaign.personaIds, persona.id]
                                      : newCampaign.personaIds.filter(
                                          (id) => id !== persona.id,
                                        ),
                                  })
                                }
                              />
                              {persona.avatar} {persona.name}
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Budget ($)</Label>
                      <Input
                        type="number"
                        value={newCampaign.budget}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            budget: e.target.value,
                          })
                        }
                        placeholder="e.g. 500"
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={creatingCampaign}
                      className="w-full text-xs"
                    >
                      Create Campaign
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Add Experiment Card */}
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-bold">
                    Queue Growth Experiment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <form onSubmit={handleAddExperiment} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Link to Campaign</Label>
                      <Select
                        value={newExperiment.campaignId}
                        onValueChange={(val) =>
                          setNewExperiment({
                            ...newExperiment,
                            campaignId: val,
                          })
                        }
                      >
                        <SelectTrigger className="text-xs h-8">
                          <SelectValue placeholder="Standalone Experiment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standalone" className="text-xs">
                            Standalone Experiment
                          </SelectItem>
                          {campaigns.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={c.id}
                              className="text-xs"
                            >
                              {c.name} ({c.channel})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Experiment Title</Label>
                      <Input
                        value={newExperiment.title}
                        onChange={(e) =>
                          setNewExperiment({
                            ...newExperiment,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. A/B test pricing copy"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Hypothesis</Label>
                      <Textarea
                        value={newExperiment.hypothesis}
                        onChange={(e) =>
                          setNewExperiment({
                            ...newExperiment,
                            hypothesis: e.target.value,
                          })
                        }
                        placeholder="If we change... then we will see... because..."
                        className="min-h-[60px] text-xs bg-background leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        Target Metrics to Measure
                      </Label>
                      <Input
                        value={newExperiment.metrics}
                        onChange={(e) =>
                          setNewExperiment({
                            ...newExperiment,
                            metrics: e.target.value,
                          })
                        }
                        placeholder="CTR, Bounce Rate, Signups"
                        className="h-8 text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={creatingExperiment}
                      className="w-full text-xs"
                    >
                      Add Experiment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {taskPlanExperiment && (
                <Card className="border border-primary/30 bg-primary/5 shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm font-bold">
                          Execution plan: {taskPlanExperiment.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Review the AI-generated checklist before creating
                          linked Tasks.
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTaskPlanExperiment(null);
                          setTaskSuggestions([]);
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 pt-2">
                    {taskSuggestions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No task suggestions were returned.
                      </p>
                    ) : (
                      taskSuggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.title}-${index}`}
                          className={`space-y-2 rounded-lg border bg-background p-3 ${suggestion.selected ? "" : "opacity-50"}`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={suggestion.selected}
                              onChange={(event) =>
                                setTaskSuggestions((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          selected: event.target.checked,
                                        }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-1"
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                              <Input
                                value={suggestion.title}
                                onChange={(event) =>
                                  setTaskSuggestions((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, title: event.target.value }
                                        : item,
                                    ),
                                  )
                                }
                                className="h-8 text-xs font-medium"
                              />
                              <Textarea
                                value={suggestion.description}
                                onChange={(event) =>
                                  setTaskSuggestions((current) =>
                                    current.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            description: event.target.value,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                className="min-h-[52px] text-xs"
                              />
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                <Select
                                  value={suggestion.listId}
                                  onValueChange={(value) =>
                                    setTaskSuggestions((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, listId: value }
                                          : item,
                                      ),
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Task list" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {taskLists.map((list) => (
                                      <SelectItem key={list.id} value={list.id}>
                                        {list.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={suggestion.priority}
                                  onValueChange={(value) =>
                                    setTaskSuggestions((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              priority:
                                                value as TaskSuggestionDraft["priority"],
                                            }
                                          : item,
                                      ),
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      "NONE",
                                      "LOW",
                                      "MEDIUM",
                                      "HIGH",
                                      "URGENT",
                                    ].map((priority) => (
                                      <SelectItem
                                        key={priority}
                                        value={priority}
                                      >
                                        {priority === "NONE"
                                          ? "No priority"
                                          : priority}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={
                                    suggestion.assigneeIds[0] || "unassigned"
                                  }
                                  onValueChange={(value) =>
                                    setTaskSuggestions((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              assigneeIds:
                                                value === "unassigned"
                                                  ? []
                                                  : [value],
                                            }
                                          : item,
                                      ),
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Owner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">
                                      Unassigned
                                    </SelectItem>
                                    {startupMembers.map((member) => (
                                      <SelectItem
                                        key={member.userId}
                                        value={member.userId}
                                      >
                                        {member.user?.name ||
                                          member.user?.email ||
                                          "Team member"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  min="0"
                                  max="90"
                                  value={suggestion.dueInDays ?? ""}
                                  onChange={(event) =>
                                    setTaskSuggestions((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? {
                                              ...item,
                                              dueInDays:
                                                event.target.value === ""
                                                  ? null
                                                  : Math.max(
                                                      0,
                                                      Math.min(
                                                        90,
                                                        Number(
                                                          event.target.value,
                                                        ),
                                                      ),
                                                    ),
                                            }
                                          : item,
                                      ),
                                    )
                                  }
                                  placeholder="Days"
                                  className="h-8 text-xs"
                                />
                                <Select
                                  value={suggestion.milestoneId}
                                  onValueChange={(value) =>
                                    setTaskSuggestions((current) =>
                                      current.map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, milestoneId: value }
                                          : item,
                                      ),
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Milestone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      No milestone
                                    </SelectItem>
                                    {taskMilestones.map((milestone) => (
                                      <SelectItem
                                        key={milestone.id}
                                        value={milestone.id}
                                      >
                                        {milestone.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  {suggestion.dueInDays === null
                                    ? "No suggested deadline"
                                    : `Due in ${suggestion.dueInDays} day${suggestion.dueInDays === 1 ? "" : "s"}`}
                                </span>
                                <span>{suggestion.phase}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="flex items-center justify-between gap-2 border-t pt-3">
                      <p className="text-[10px] text-muted-foreground">
                        {
                          taskSuggestions.filter(
                            (suggestion) => suggestion.selected,
                          ).length
                        }{" "}
                        selected · linked to this experiment
                      </p>
                      <Button
                        onClick={handleCreateTaskPlan}
                        disabled={
                          createExperimentTasks.isPending ||
                          taskSuggestions.length === 0
                        }
                        size="sm"
                        className="text-xs"
                      >
                        {createExperimentTasks.isPending
                          ? "Creating tasks..."
                          : "Create linked tasks"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conclude Modal / Overlay Log */}
              {activeExperiment && (
                <Card className="border border-primary/30 bg-primary/5 shadow-md">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">
                        Conclude Experiment: {activeExperiment.title}
                      </CardTitle>
                      <Button
                        onClick={() => setActiveExperiment(null)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <form
                      onSubmit={handleConcludeExperiment}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs">Measured Results</Label>
                        <Textarea
                          value={expLog.results}
                          onChange={(e) =>
                            setExpLog({ ...expLog, results: e.target.value })
                          }
                          placeholder="e.g. CTR increased from 2.1% to 3.5% over a cohort of 500 visitors."
                          className="min-h-[60px] text-xs bg-background"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          Key Learnings & Action Items
                        </Label>
                        <Textarea
                          value={expLog.learnings}
                          onChange={(e) =>
                            setExpLog({ ...expLog, learnings: e.target.value })
                          }
                          placeholder="What did we learn? Should we deploy this channel at scale?"
                          className="min-h-[60px] text-xs bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Conclusion Status</Label>
                          <Select
                            value={expLog.conclusion}
                            onValueChange={(val) =>
                              setExpLog({ ...expLog, conclusion: val })
                            }
                          >
                            <SelectTrigger className="text-xs h-8 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SUCCESS" className="text-xs">
                                Success (Verified)
                              </SelectItem>
                              <SelectItem value="FAILURE" className="text-xs">
                                Failure (Rejected)
                              </SelectItem>
                              <SelectItem
                                value="INCONCLUSIVE"
                                className="text-xs"
                              >
                                Inconclusive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="submit"
                            size="sm"
                            className="w-full text-xs h-8"
                          >
                            Conclude & Save
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Campaigns & Experiments List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Active Growth Experiments
                </h3>

                {experiments.length === 0 ? (
                  <Card className="border-dashed h-full flex flex-col items-center justify-center p-8 text-center min-h-[250px]">
                    <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-3 animate-pulse" />
                    <h3 className="text-sm font-semibold">
                      No Experiments Running
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Model campaigns and launch experiments to track your
                      scientific marketing hypothesis progress.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {experiments.map((exp) => (
                      <Card
                        key={exp.id}
                        className="border border-border/80 shadow-sm"
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-sm font-bold">
                                {exp.title}
                              </CardTitle>
                              {exp.campaign && (
                                <CardDescription className="text-[10px] mt-0.5">
                                  Campaign: {exp.campaign.name} (
                                  {exp.campaign.channel})
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge
                                variant={
                                  exp.status === "RUNNING"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[9px] font-bold"
                              >
                                {exp.status}
                              </Badge>

                              {exp.status === "CONCLUDED" && (
                                <Badge
                                  className={`text-[9px] font-bold ${
                                    exp.conclusion === "SUCCESS"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : exp.conclusion === "FAILURE"
                                        ? "bg-red-100 text-red-700 border-red-200"
                                        : "bg-amber-100 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {exp.conclusion}
                                </Badge>
                              )}
                              {exp.status === "PLANNED" && (
                                <Button
                                  onClick={() => handleStartExperiment(exp)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  Start
                                </Button>
                              )}
                              <Button
                                onClick={() => handleGenerateTaskPlan(exp)}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 gap-1"
                                disabled={suggestTasks.isPending}
                              >
                                {suggestTasks.isPending &&
                                taskPlanExperiment?.id === exp.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ClipboardList className="h-3 w-3" />
                                )}
                                Plan tasks
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase text-muted-foreground">
                              Hypothesis
                            </span>
                            <p className="text-xs text-foreground bg-muted/30 p-2.5 rounded-lg leading-relaxed">
                              {exp.hypothesis}
                            </p>
                          </div>

                          <div className="space-y-1.5 border-t pt-3">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                                <Check className="h-3 w-3" /> Execution progress
                              </span>
                              <span>
                                {exp.progress?.completed ?? 0}/
                                {exp.progress?.total ?? 0} tasks ·{" "}
                                {exp.progress?.percent ?? 0}%
                              </span>
                            </div>
                            <Progress
                              value={exp.progress?.percent ?? 0}
                              className="h-1.5"
                            />
                            {(exp.progress?.overdue ?? 0) > 0 && (
                              <p className="text-[10px] text-amber-600">
                                {exp.progress.overdue} overdue execution task
                                {exp.progress.overdue === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t">
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Activity className="w-3.5 h-3.5" />
                              <span>Metrics: {exp.metrics}</span>
                            </div>

                            {exp.status === "RUNNING" && (
                              <Button
                                onClick={() => {
                                  setActiveExperiment(exp);
                                  setExpLog({
                                    results: exp.results || "",
                                    conclusion: exp.conclusion || "SUCCESS",
                                    status: "CONCLUDED",
                                    learnings: exp.learnings || "",
                                  });
                                }}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 gap-1"
                              >
                                <span>Conclude</span>
                              </Button>
                            )}
                          </div>

                          {exp.status === "CONCLUDED" && (
                            <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs">
                              <div>
                                <span className="font-bold text-foreground">
                                  Logged Results:
                                </span>{" "}
                                <span className="text-muted-foreground leading-relaxed">
                                  {exp.results || "No results logged."}
                                </span>
                              </div>
                              {exp.learnings && (
                                <div className="border-t pt-2 mt-2">
                                  <span className="font-bold text-foreground">
                                    Key Learnings:
                                  </span>{" "}
                                  <span className="text-muted-foreground italic leading-relaxed">
                                    {exp.learnings}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
