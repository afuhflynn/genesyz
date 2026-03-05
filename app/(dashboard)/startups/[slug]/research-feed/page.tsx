"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Brain,
  Calendar,
  ExternalLink,
  FileText,
  LineChart,
  Bell,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";

interface ResearchFeedItem {
  id: string;
  type: "IDEA_RESEARCH" | "WEEKLY_REPORT" | "WEEKLY_DIGEST" | "WEEKLY_REMINDER";
  title: string;
  summary: string | null;
  content: any;
  createdAt: string;
  ideaId: string | null;
  idea?: {
    id: string;
    title: string;
  };
}

export default function StartupResearchFeedPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [items, setItems] = useState<ResearchFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: "all",
    dateFrom: "",
    dateTo: "",
  });

  const fetchFeed = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const res = await fetch(`/api/startups/${slug}/research-feed?${searchParams}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [filters, slug]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IDEA_RESEARCH":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "WEEKLY_REPORT":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "WEEKLY_DIGEST":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "WEEKLY_REMINDER":
        return <Bell className="h-4 w-4 text-amber-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "IDEA_RESEARCH":
        return "Initial Research";
      case "WEEKLY_REPORT":
        return "Weekly Report";
      case "WEEKLY_DIGEST":
        return "Strategic Digest";
      case "WEEKLY_REMINDER":
        return "Reminder";
      default:
        return type;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Startup Research Feed
        </h1>
        <p className="text-muted-foreground mt-1">
          Historical AI insights, reports, and reminders for your startup
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="IDEA_RESEARCH">Initial Research</SelectItem>
                  <SelectItem value="WEEKLY_REPORT">Weekly Reports</SelectItem>
                  <SelectItem value="WEEKLY_DIGEST">Strategic Digests</SelectItem>
                  <SelectItem value="WEEKLY_REMINDER">Reminders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                className="h-8"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                className="h-8"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No items found in your startup's research feed yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-muted rounded-full">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {item.title}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] h-4">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    
                    {item.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">
                        "{item.summary}"
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      {item.type === "IDEA_RESEARCH" && item.ideaId && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px]"
                        >
                          <Link href={`/ideas/${item.ideaId}`}>
                            <Brain className="mr-1 h-3 w-3" />
                            View Research
                          </Link>
                        </Button>
                      )}
                      
                      {item.type === "WEEKLY_REPORT" && (
                         <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px]"
                        >
                          <Link href={`/startups/${slug}/dashboard`}>
                            <LineChart className="mr-1 h-3 w-3" />
                            View Metrics
                          </Link>
                        </Button>
                      )}

                      {item.type === "WEEKLY_DIGEST" && (
                         <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px]"
                        >
                          <Link href={`/startups/${slug}/chat`}>
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Discuss Strategy
                          </Link>
                        </Button>
                      )}
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
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => fetchFeed(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => fetchFeed(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
