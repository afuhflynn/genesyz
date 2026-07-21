"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Target,
} from "lucide-react";

interface HubCoachData {
  overview: {
    sentiment: string;
    summary: string;
    topBottleneck: string;
  };
  cohortPatterns: {
    observation: string;
    impact: string;
    recommendation: string;
  }[];
  atRiskStartups: {
    name: string;
    reason: string;
    suggestedIntervention: string;
  }[];
  kpiForecast: {
    onTrack: boolean;
    analysis: string;
  };
}

export function HubCoach({ slug }: { slug: string }) {
  const [analysis, setAnalysis] = useState<HubCoachData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch(`/api/accelerators/${slug}/coach`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.data) {
        setAnalysis(data.data);
        toast.success("Cohort analysis complete!");
      }
    } catch (error) {
      toast.error("Hub Coach failed to analyze cohort");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Hub AI Coach
          </h2>
          <p className="text-sm text-muted-foreground">
            Strategic oversight and cohort-wide pattern recognition.
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing} size="sm">
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {analysis ? "Refresh Analysis" : "Analyze Cohort"}
        </Button>
      </div>

      {!analysis && !isAnalyzing ? (
        <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">Ready for Insights?</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            The Hub Coach will scan all startups in your cohorts, their weekly
            updates, and your program KPIs to provide a strategic health report.
          </p>
          <Button onClick={runAnalysis}>Generate First Report</Button>
        </Card>
      ) : isAnalyzing ? (
        <div className="space-y-6">
          <Card className="animate-pulse h-[200px] w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Card className="animate-pulse h-[150px]" />
            <Card className="animate-pulse h-[150px]" />
          </div>
        </div>
      ) : (
        analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Health Card */}
            <Card className="md:col-span-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Cohort Health Synthesis
                  </CardTitle>
                  <Badge
                    variant={
                      analysis.overview.sentiment === "EXCELLENT"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {analysis.overview.sentiment}
                  </Badge>
                </div>
                <CardDescription>
                  Strategic summary based on latest updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm leading-relaxed">
                  {analysis.overview.summary}
                </p>
                <div className="bg-background/80 p-4 rounded-lg border">
                  <p className="text-[10px] font-bold uppercase text-primary mb-1">
                    Critical Bottleneck
                  </p>
                  <p className="text-sm font-medium">
                    {analysis.overview.topBottleneck}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Observed Patterns
                  </h4>
                  <div className="grid gap-3">
                    {analysis.cohortPatterns.map((p, i) => (
                      <div
                        key={i}
                        className="text-xs p-3 border rounded-md bg-background"
                      >
                        <p className="font-bold mb-1">{p.observation}</p>
                        <p className="text-muted-foreground mb-2">{p.impact}</p>
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <Lightbulb className="h-3 w-3" />
                          {p.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar: Risks & KPIs */}
            <div className="space-y-6">
              <Card className="border-destructive/20 shadow-none">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" /> At-Risk
                    Startups
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 space-y-4">
                  {analysis.atRiskStartups.map((s, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{s.name}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {s.reason}
                      </p>
                      <p className="text-[10px] text-destructive italic">
                        {s.suggestedIntervention}
                      </p>
                      {i < analysis.atRiskStartups.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20 shadow-none bg-emerald-50/10">
                <CardHeader className="py-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" /> KPI Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${analysis.kpiForecast.onTrack ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    <span className="text-xs font-medium">
                      {analysis.kpiForecast.onTrack
                        ? "On Track"
                        : "Lagging Targets"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {analysis.kpiForecast.analysis}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
}
