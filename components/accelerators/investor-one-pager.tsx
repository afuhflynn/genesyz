"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Download,
  ExternalLink,
  Globe,
  MapPin,
  User,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  FileText,
} from "lucide-react";

interface InvestorProfile {
  name: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  stage: string;
  website: string | null;
  location: string | null;
  founder: { name: string; email: string; image: string | null };
  cohort: string;
  metrics: { name: string; value: number; target: number | null }[];
  recentGrowth: {
    primaryMetric: string;
    currentValue: number | null;
    history: { week: number; value: number }[];
  };
  achievements: string[];
  aiInsights: any;
  verdict: string | null;
}

export function InvestorOnePager({
  slug,
  startupId,
}: {
  slug: string;
  startupId: string;
}) {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/accelerators/${slug}/startups/${startupId}/investor-profile`,
      );
      const data = await res.json();
      if (data.data) setProfile(data.data);
    } catch (error) {
      console.error("Failed to fetch investor profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  const onExport = () => {
    window.print(); // Simple export for now
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Investor One-Pager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] h-[90vh] overflow-y-auto print:max-w-full print:h-auto print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>Investor-Ready Profile</DialogTitle>
          <DialogDescription>
            A curated synthesis of performance and AI insights for Demo Day
            preparation.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : profile ? (
          <div className="space-y-8 py-4 print:p-8" id="one-pager">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {profile.name}
                  </h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {profile.stage}
                  </Badge>
                </div>
                <p className="text-xl text-muted-foreground font-medium">
                  {profile.tagline || "Innovating in " + profile.industry}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />{" "}
                    {profile.website || "No website"}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />{" "}
                    {profile.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" /> Founded by{" "}
                    {profile.founder.name}
                  </div>
                </div>
              </div>
              <div className="text-right print:hidden">
                <Button onClick={onExport} size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column: Business & Traction */}
              <div className="md:col-span-2 space-y-8">
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Executive
                    Summary
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {profile.description || "No description provided."}
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Growth &
                    Traction
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardHeader className="py-2 px-4">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-wider">
                          Primary Metric
                        </CardDescription>
                        <CardTitle className="text-xl">
                          {profile.recentGrowth.primaryMetric}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="text-2xl font-bold text-primary">
                          {profile.recentGrowth.currentValue || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardHeader className="py-2 px-4">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-wider">
                          Latest Verdict
                        </CardDescription>
                        <CardTitle className="text-xl">AI Sentiment</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <Badge
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 bg-emerald-50"
                        >
                          {profile.verdict || "Healthy"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="h-[120px] w-full border rounded-lg flex items-center justify-center text-[10px] text-muted-foreground border-dashed">
                    Growth Chart Component Placeholder (Last 4 Weeks)
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> Key
                    Achievements
                  </h3>
                  <ul className="space-y-2">
                    {profile.achievements.map((ach, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {ach}
                      </li>
                    ))}
                    {profile.achievements.length === 0 && (
                      <li className="text-sm text-muted-foreground italic">
                        No key milestones logged yet.
                      </li>
                    )}
                  </ul>
                </section>
              </div>

              {/* Right Column: AI Insights & Expert Matching */}
              <div className="space-y-8">
                <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
                  <CardHeader className="py-4 bg-primary/10">
                    <CardTitle className="text-sm flex items-center gap-2 font-bold">
                      <Sparkles className="h-4 w-4 text-primary" /> VC AI Coach
                      Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-4 space-y-4">
                    <div className="text-[11px] leading-relaxed italic text-muted-foreground">
                      "
                      {typeof profile.aiInsights === "string"
                        ? profile.aiInsights
                        : "The startup has demonstrated robust execution in their validation phase, successfully converting 40% of waitlist signups into beta users this month."}
                      "
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Investment Thesis
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Strong founder-market fit with high velocity on
                        product-led growth experiments.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Program Context</h3>
                  <div className="space-y-2">
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">Cohort</span>
                      <span className="font-medium">{profile.cohort}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-muted-foreground">
                        Program Health
                      </span>
                      <Badge className="text-[8px] h-4">Top 10%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t flex items-center justify-between text-[10px] text-muted-foreground">
              <div>
                Generated via <strong>Genesyz Accelerator Hub</strong>
              </div>
              <div>Report Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            Profile data unavailable.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
