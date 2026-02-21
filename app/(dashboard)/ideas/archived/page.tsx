"use client";

import { ArchiveRestore, MoreVertical, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { DeleteIdeaDialog } from "@/components/ideas/[id]/DeleteIdea";
import { EditIdeaDialog } from "@/components/ideas/[id]/EditIdea";
import { SearchBar } from "@/components/ideas/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InfiniteScroll } from "@/components/ui/InfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteIdeas, useUnArchiveIdea } from "@/hooks";
import { formatRelativeTime } from "@/lib/utils";
import { searchParamsSchema } from "@/nuqs";

export default function ArchivedIdeasPage() {
  const [params] = useQueryStates(searchParamsSchema);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteIdeas({
    query: params.search as string,
    archived: true,
  });
  const unarchiveIdea = useUnArchiveIdea();

  const ideas = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archived Ideas</h1>
          <p className="text-muted-foreground">
            Manage and track your archived startup ideas
          </p>
        </div>
        <Button asChild>
          <Link href="/ideas/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>
      <SearchBar />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["a", "b", "c", "d", "e", "f"].map((id) => (
            <Card key={id}>
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
      ) : ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10">
          <div className="bg-background p-4 rounded-full mb-4">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No archived ideas</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {params.search
              ? "Try adjusting your search terms."
              : "You don't have any archived ideas yet."}
          </p>
          {!params.search && (
            <Button asChild>
              <Link href="/ideas">View Ideas</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <div key={idea.id} className="relative group">
                <Link href={`/ideas/${idea.id}`} className="block h-full">
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
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 h-15">
                        {idea.summary || "No summary available"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatRelativeTime(idea.createdAt)}</span>
                        <Badge
                          variant="outline"
                          className="capitalize text-xs h-5 px-1.5 font-normal "
                        >
                          {idea.status.toLowerCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="bg-background">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <EditIdeaDialog
                          id={idea.id}
                          archived={true}
                          title={idea.title as string}
                          summary={idea.summary as string}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => unarchiveIdea.mutate(idea.id)}
                      >
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Unarchive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <DeleteIdeaDialog id={idea.id} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isFetching={isFetching}
          />
        </>
      )}
    </div>
  );
}
