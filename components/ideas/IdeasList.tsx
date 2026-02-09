"use client";

import {
  ArrowUpDown,
  Calendar,
  Filter,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LocationBadge } from "@/components/location";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatRelativeTime } from "@/lib/utils";

interface Idea {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  isArchived: boolean;
  createdAt: string;
  researchedAt: string | null;
  targetLocation: string | null;
  locationContext: any;
  scores: any[];
  inputs: any[];
}

interface IdeasListProps {
  ideas: Idea[];
  onFilter?: (filters: any) => void;
}

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  PROCESSING: { label: "Processing", color: "bg-blue-500" },
  RESEARCHED: { label: "Researched", color: "bg-green-500" },
  FAILED: { label: "Failed", color: "bg-red-500" },
};

export function IdeasList({ ideas, onFilter }: IdeasListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter((idea) => {
      const matchesSearch =
        !search ||
        idea.title?.toLowerCase().includes(search.toLowerCase()) ||
        idea.summary?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || idea.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "title":
          comparison = (a.title || "").localeCompare(b.title || "");
          break;
        case "score": {
          const scoreA = a.scores[0]?.overallScore || 0;
          const scoreB = b.scores[0]?.overallScore || 0;
          comparison = scoreA - scoreB;
          break;
        }
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="RESEARCHED">Researched</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSortBy("createdAt");
                setSortOrder("desc");
              }}
            >
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortBy("createdAt");
                setSortOrder("asc");
              }}
            >
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortBy("title");
                setSortOrder("asc");
              }}
            >
              A-Z
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortBy("title");
                setSortOrder("desc");
              }}
            >
              Z-A
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortBy("score");
                setSortOrder("desc");
              }}
            >
              Highest Score
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSortBy("score");
                setSortOrder("asc");
              }}
            >
              Lowest Score
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredIdeas.length} of {ideas.length} ideas
      </p>

      {/* Ideas Grid */}
      <div className="grid gap-4">
        {filteredIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No ideas found matching your criteria
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredIdeas.map((idea) => {
            const latestScore = idea.scores[0];
            const statusConfig =
              STATUS_CONFIG[idea.status as keyof typeof STATUS_CONFIG] ||
              STATUS_CONFIG.PENDING;

            return (
              <Link key={idea.id} href={`/ideas/${idea.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {idea.title || "Untitled Idea"}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={cn("text-white", statusConfig.color)}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Summary */}
                        {idea.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {idea.summary}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeTime(idea.createdAt)}
                          </span>
                          {idea.targetLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {idea.targetLocation}
                            </span>
                          )}
                          {latestScore && (
                            <Badge variant="outline" className="text-xs">
                              Score: {latestScore.overallScore}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.preventDefault()}
                        >
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
