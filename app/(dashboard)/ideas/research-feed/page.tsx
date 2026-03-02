"use client";

import { formatDistanceToNow } from "date-fns";
import { Brain, Calendar, ExternalLink, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ResearchItem {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  researchedAt: Date | null;
  createdAt: Date;
  score: number | null;
}

export default function ResearchFeedPage() {
  const [ideas, setIdeas] = useState<ResearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    minScore: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchIdeas = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.minScore && { minScore: filters.minScore }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const res = await fetch(`/api/ideas/research-feed?${params}`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESEARCHED":
        return "bg-green-100 text-green-800";
      case "VALIDATING":
        return "bg-blue-100 text-blue-800";
      case "VALIDATED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Research Feed
        </h1>
        <p className="text-muted-foreground mt-1">
          View all your researched ideas in one place
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="RESEARCHED">Researched</SelectItem>
                  <SelectItem value="VALIDATING">Validating</SelectItem>
                  <SelectItem value="VALIDATED">Validated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters({ ...filters, minScore: e.target.value })
                }
              />
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : ideas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No research found. Start researching your ideas!
              </p>
              <Button asChild className="mt-4">
                <Link href="/ideas">Go to Ideas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          ideas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {idea.score !== null && (
                        <span
                          className={`font-bold text-lg ${getScoreColor(
                            idea.score,
                          )}`}
                        >
                          {idea.score}
                        </span>
                      )}
                      <Link
                        href={`/ideas/${idea.id}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {idea.title || "Untitled Idea"}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getStatusColor(
                          idea.status,
                        )}`}
                      >
                        {idea.status}
                      </span>
                    </div>
                    {idea.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {idea.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      {idea.researchedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Researched{" "}
                          {formatDistanceToNow(new Date(idea.researchedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                      >
                        <Link href={`/ideas/${idea.id}`}>
                          View Full <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => fetchIdeas(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => fetchIdeas(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
