"use client";

import {
  useIdeas,
  useDeleteIdea,
  useRerunResearch,
  useUpdateIdea,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function IdeasPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useIdeas({ page: 1, limit: 50 });
  const deleteIdea = useDeleteIdea();
  const rerunResearch = useRerunResearch();
  const updateIdea = useUpdateIdea();

  const [editingIdea, setEditingIdea] = useState<{
    id: string;
    title: string;
    summary: string;
  } | null>(null);

  const filteredIdeas = data?.data.filter(
    (idea) =>
      idea.title?.toLowerCase().includes(search.toLowerCase()) ||
      idea.summary?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = () => {
    if (!editingIdea) return;
    updateIdea.mutate(
      {
        id: editingIdea.id,
        data: { title: editingIdea.title, summary: editingIdea.summary },
      },
      {
        onSuccess: () => setEditingIdea(null),
      }
    );
  };

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

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingIdea({
                          id: idea.id,
                          title: idea.title || "",
                          summary: idea.summary || "",
                        });
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        rerunResearch.mutate(idea.id);
                      }}
                      disabled={idea.status === "PROCESSING"}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Redo Research
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          confirm("Are you sure you want to delete this idea?")
                        ) {
                          deleteIdea.mutate(idea.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Idea Dialog */}
      <Dialog
        open={!!editingIdea}
        onOpenChange={(open) => !open && setEditingIdea(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
            <DialogDescription>
              Update the title and summary of your idea.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editingIdea?.title || ""}
                onChange={(e) =>
                  setEditingIdea((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                rows={5}
                value={editingIdea?.summary || ""}
                onChange={(e) =>
                  setEditingIdea((prev) =>
                    prev ? { ...prev, summary: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIdea(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateIdea.isPending}>
              {updateIdea.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
