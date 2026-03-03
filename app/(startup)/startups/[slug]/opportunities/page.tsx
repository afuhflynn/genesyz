"use client";

import { format } from "date-fns";
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
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useGenerateOpportunities } from "@/hooks";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  eligibility?: string;
  benefits?: string;
  deadline?: string | null;
  status: string;
  source: string;
  createdAt: string;
}

interface GeneratedOpportunity {
  title: string;
  description: string;
  url?: string;
  category: string;
  eligibility?: string;
  benefits?: string;
  deadline?: string | null;
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
  const [slug, setSlug] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [generatedOpportunities, setGeneratedOpportunities] = useState<
    GeneratedOpportunity[]
  >([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generationWarning, setGenerationWarning] = useState<string | null>(
    null,
  );
  const [addingOpportunityTitle, setAddingOpportunityTitle] = useState<
    string | null
  >(null);

  const generateMutation = useGenerateOpportunities(slug);

  useEffect(() => {
    params.then((resolvedParams) => setSlug(resolvedParams.slug));
  }, [params]);

  const fetchOpportunities = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/startups/${slug}/opportunities`);
      if (!res.ok) {
        throw new Error("Failed to fetch opportunities");
      }

      const data = await res.json();
      setOpportunities(data.data || []);
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchOpportunities();
    }
  }, [slug, fetchOpportunities]);

  const handleGenerateOpportunities = async () => {
    if (!slug) return;

    try {
      const result = await generateMutation.mutateAsync();
      setGeneratedOpportunities(result.data || []);
      setGenerationWarning(result.meta?.searchWarning || null);
      setIsGenerateOpen(true);
    } catch (error) {
      console.error("Failed to generate opportunities:", error);
    }
  };

  const handleAddGeneratedOpportunity = async (
    opportunity: GeneratedOpportunity,
  ) => {
    if (!slug) return;

    setAddingOpportunityTitle(opportunity.title);
    try {
      const res = await fetch(`/api/startups/${slug}/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: opportunity.title,
          description: opportunity.description,
          url: opportunity.url || "",
          category: opportunity.category,
          eligibility: opportunity.eligibility,
          benefits: opportunity.benefits,
          deadline: opportunity.deadline,
          status: "DISCOVERED",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add opportunity");
      }

      await fetchOpportunities();
      setGeneratedOpportunities((previous) =>
        previous.filter((item) => item.title !== opportunity.title),
      );
      toast.success("Opportunity added to tracked list");
    } catch (error) {
      console.error("Failed to add opportunity:", error);
      toast.error("Failed to add opportunity");
    } finally {
      setAddingOpportunityTitle(null);
    }
  };

  const handleDismissGeneratedOpportunity = (
    opportunity: GeneratedOpportunity,
  ) => {
    setGeneratedOpportunities((previous) =>
      previous.filter((item) => item.title !== opportunity.title),
    );
  };

  const filteredOpportunities =
    filterStatus === "all"
      ? opportunities
      : opportunities.filter((item) => item.status === filterStatus);

  const statusCounts = {
    all: opportunities.length,
    DISCOVERED: opportunities.filter((item) => item.status === "DISCOVERED")
      .length,
    BOOKMARKED: opportunities.filter((item) => item.status === "BOOKMARKED")
      .length,
    TO_APPLY: opportunities.filter((item) => item.status === "TO_APPLY").length,
    APPLIED: opportunities.filter((item) => item.status === "APPLIED").length,
    INTERVIEWING: opportunities.filter((item) => item.status === "INTERVIEWING")
      .length,
    ACCEPTED: opportunities.filter((item) => item.status === "ACCEPTED").length,
    REJECTED: opportunities.filter((item) => item.status === "REJECTED").length,
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateOpportunities}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate AI Recommendations
          </Button>

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
      </div>

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI Opportunity Recommendations</DialogTitle>
            <DialogDescription>
              Review suggestions before adding them to your tracked
              opportunities.
            </DialogDescription>
          </DialogHeader>

          {generationWarning && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {generationWarning}
            </div>
          )}

          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {generatedOpportunities.length === 0 ? (
              <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
                No pending generated opportunities.
              </div>
            ) : (
              generatedOpportunities.map((opportunity, index) => {
                const icon = CATEGORY_ICONS[opportunity.category] || Lightbulb;
                const Icon = icon;

                return (
                  <Card key={`${opportunity.title}-${index}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-primary/10 p-2">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {opportunity.title}
                            </CardTitle>
                            <CardDescription>
                              {CATEGORY_LABELS[opportunity.category] ||
                                opportunity.category}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {opportunity.description}
                      </p>

                      {opportunity.deadline && (
                        <div className="text-xs text-muted-foreground">
                          Deadline:{" "}
                          {format(
                            new Date(opportunity.deadline),
                            "MMM d, yyyy",
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAddGeneratedOpportunity(opportunity)
                          }
                          disabled={
                            addingOpportunityTitle === opportunity.title
                          }
                        >
                          {addingOpportunityTitle === opportunity.title ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Add to Tracked
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDismissGeneratedOpportunity(opportunity)
                          }
                        >
                          Dismiss
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="flex h-auto flex-wrap">
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
              {[1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-48" />
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
                      <p className="line-clamp-3 text-sm text-muted-foreground">
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
