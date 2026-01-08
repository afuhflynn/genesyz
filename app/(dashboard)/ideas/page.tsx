"use client";

import { useIdeas } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";

export default function IdeasPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useIdeas({ page: 1, limit: 50 });

  const filteredIdeas = data?.data.filter(
    (idea) =>
      idea.title?.toLowerCase().includes(search.toLowerCase()) ||
      idea.summary?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Ideas</h1>
          <p className="text-muted-foreground">
            Manage and track your startup ideas
          </p>
        </div>
        <Button asChild>
          <Link href="/ideas/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Add filters here if needed */}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredIdeas?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10">
          <div className="bg-background p-4 rounded-full mb-4">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No ideas found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {search
              ? "Try adjusting your search terms."
              : "You haven't created any ideas yet. Start by capturing your first one!"}
          </p>
          {!search && (
            <Button asChild>
              <Link href="/ideas/new">Create Idea</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas?.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="block group"
            >
              <Card className="h-full transition-colors hover:bg-muted/50 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                      {idea.title || "Untitled Idea"}
                    </CardTitle>
                    {idea.scores[0]?.overallScore && (
                      <Badge
                        variant={
                          idea.scores[0].overallScore >= 70
                            ? "default"
                            : "secondary"
                        }
                      >
                        {idea.scores[0].overallScore}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 h-[60px]">
                    {idea.summary || "No summary available"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatRelativeTime(idea.createdAt)}</span>
                    <Badge
                      variant="outline"
                      className="capitalize text-xs h-5 px-1.5 font-normal"
                    >
                      {idea.status.toLowerCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
