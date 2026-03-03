"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Building,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Loader2,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateOpportunities, useStartup } from "@/hooks";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  eligibility?: string;
  benefits?: string;
  deadline?: Date | null;
  status: string;
  source: string;
  createdAt: Date;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  eligibility?: string;
  benefits?: string;
  deadline?: Date | null;
  status: string;
  source: string;
  createdAt: Date;
}

const CATEGORY_ICONS: Record<string, typeof Rocket> = {
  FELLOWSHIP: Users,
  SCHOLARSHIP: GraduationCap,
  FUNDING: Lightbulb,
  COMPETITION: Trophy,
  ACCELERATOR: Rocket,
  GRANT: Building,
  MENTORSHIP: Users,
  OTHER: Lightbulb,
};

const CATEGORY_LABELS: Record<string, string> = {
  FELLOWSHIP: "Fellowship",
  SCHOLARSHIP: "Scholarship",
  FUNDING: "Funding",
  COMPETITION: "Competition",
  ACCELERATOR: "Accelerator",
  GRANT: "Grant",
  MENTORSHIP: "Mentorship",
  OTHER: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  DISCOVERED: "bg-gray-100 text-gray-800",
  BOOKMARKED: "bg-blue-100 text-blue-800",
  TO_APPLY: "bg-yellow-100 text-yellow-800",
  APPLIED: "bg-purple-100 text-purple-800",
  INTERVIEWING: "bg-orange-100 text-orange-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function OpportunitiesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string>("");

  React.useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [generatedOpportunities, setGeneratedOpportunities] = useState<any[]>(
    [],
  );
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const { data: startup } = useStartup(slug);
  const generateMutation = useGenerateOpportunities(slug);

  const fetchOpportunities = async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/startups/${slug}/opportunities`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (slug) {
      fetchOpportunities();
    }
  }, [slug]);

  const handleGenerateOpportunities = async () => {
    if (!slug) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/startups/${slug}/opportunities/generate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedOpportunities(data.data || []);
        setIsGenerateOpen(true);
      }
    } catch (error) {
      console.error("Failed to generate opportunities:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGeneratedOpportunity = async (opp: any) => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/startups/${slug}/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: opp.title,
          description: opp.description,
          url: opp.url || "",
          category: opp.category,
          eligibility: opp.eligibility,
          benefits: opp.benefits,
          deadline: opp.deadline,
          status: "DISCOVERED",
        }),
      });
      if (res.ok) {
        await fetchOpportunities();
        setGeneratedOpportunities((prev) =>
          prev.filter((o) => o.title !== opp.title),
        );
        if (generatedOpportunities.length === 1) {
          setIsGenerateOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to add opportunity:", error);
    }
  };

  const filteredOpportunities =
    filterStatus === "all"
      ? opportunities
      : opportunities.filter((o) => o.status === filterStatus);

  const statusCounts = {
    all: opportunities.length,
    DISCOVERED: opportunities.filter((o) => o.status === "DISCOVERED").length,
    BOOKMARKED: opportunities.filter((o) => o.status === "BOOKMARKED").length,
    TO_APPLY: opportunities.filter((o) => o.status === "TO_APPLY").length,
    APPLIED: opportunities.filter((o) => o.status === "APPLIED").length,
    INTERVIEWING: opportunities.filter((o) => o.status === "INTERVIEWING")
      .length,
    ACCEPTED: opportunities.filter((o) => o.status === "ACCEPTED").length,
    REJECTED: opportunities.filter((o) => o.status === "REJECTED").length,
  };

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
            Opportunities
          </h1>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Opportunity</DialogTitle>
              <DialogDescription>
                Add a fellowship, scholarship, funding opportunity, or
                competition to track.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Y Combinator W26" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCELERATOR">Accelerator</SelectItem>
                    <SelectItem value="FELLOWSHIP">Fellowship</SelectItem>
                    <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
                    <SelectItem value="FUNDING">Funding</SelectItem>
                    <SelectItem value="COMPETITION">Competition</SelectItem>
                    <SelectItem value="GRANT">Grant</SelectItem>
                    <SelectItem value="MENTORSHIP">Mentorship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" placeholder="https://..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Brief description..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddOpen(false)}>
                Add Opportunity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
              {statusCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="TO_APPLY" className="flex items-center gap-2">
            To Apply
            <span className="ml-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs">
              {statusCounts.TO_APPLY}
            </span>
          </TabsTrigger>
          <TabsTrigger value="APPLIED" className="flex items-center gap-2">
            Applied
            <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs">
              {statusCounts.APPLIED}
            </span>
          </TabsTrigger>
          <TabsTrigger value="INTERVIEWING" className="flex items-center gap-2">
            Interviewing
            <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs">
              {statusCounts.INTERVIEWING}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ACCEPTED" className="flex items-center gap-2">
            Accepted
            <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs">
              {statusCounts.ACCEPTED}
            </span>
          </TabsTrigger>
          <TabsTrigger value="REJECTED" className="flex items-center gap-2">
            Rejected
            <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs">
              {statusCounts.REJECTED}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-semibold">
                  No opportunities found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add opportunities to track or generate AI recommendations.
                </p>
                <Button className="mt-4" onClick={() => setIsAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Opportunity
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity) => {
                const Icon = CATEGORY_ICONS[opportunity.category] || Lightbulb;
                return (
                  <Card key={opportunity.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {opportunity.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {CATEGORY_LABELS[opportunity.category] ||
                              opportunity.category}
                          </CardDescription>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          STATUS_COLORS[opportunity.status] || "bg-gray-100"
                        }`}
                      >
                        {opportunity.status.replace("_", " ")}
                      </span>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {opportunity.description}
                      </p>
                      {opportunity.deadline && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          Deadline:{" "}
                          {format(
                            new Date(opportunity.deadline),
                            "MMM d, yyyy",
                          )}
                        </div>
                      )}
                    </CardContent>
                    <div className="flex items-center gap-2 border-t p-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={opportunity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
