"use client";

import { Edit, Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useIdeas, useUpdateIdea, useUpdateIdeaPrompt } from "@/hooks";
import type { IdeaWithDetails } from "@/lib/api-client";
import { searchParamsSchema } from "@/nuqs";

export const EditIdeaDialog = ({
  id,
  title,
  summary,
  originalPrompt,
  archived = true,
}: {
  id: string;
  summary: string | null;
  title: string | null;
  originalPrompt?: string | null;
  archived?: boolean;
}) => {
  const updateIdea = useUpdateIdea();
  const updatePrompt = useUpdateIdeaPrompt();
  const [params] = useQueryStates(searchParamsSchema);
  const { refetch } = useIdeas({
    page: parseInt(params.page),
    limit: parseInt(params.limit),
    query: params.search as string,
    archived,
  });
  const [open, setOpen] = useState(false);
  const [editingIdea, setEditingIdea] =
    useState<Partial<IdeaWithDetails> | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [triggerResearch, setTriggerResearch] = useState(false);

  useEffect(() => {
    setEditingIdea({
      id,
      title,
      summary,
    });
    setEditedPrompt(originalPrompt || "");
    setTriggerResearch(false);
  }, [setEditingIdea, id, title, summary, originalPrompt]);

  const handleUpdate = async () => {
    if (!editingIdea) return;

    const ideaId = editingIdea.id as string;
    const titleChanged = (editingIdea.title || "") !== (title || "");
    const summaryChanged = (editingIdea.summary || "") !== (summary || "");
    const promptChanged = editedPrompt !== (originalPrompt || "");
    const shouldUpdateIdea = titleChanged || summaryChanged;

    try {
      if (shouldUpdateIdea) {
        await updateIdea.mutateAsync({
          id: ideaId,
          data: {
            title: (editingIdea.title || "").trim(),
            summary: (editingIdea.summary || "").trim(),
          },
        });
      }

      if (promptChanged) {
        if (!editedPrompt.trim()) {
          toast.error("Original prompt cannot be empty");
          return;
        }

        await updatePrompt.mutateAsync({
          id: ideaId,
          prompt: editedPrompt.trim(),
          triggerResearch,
        });
      }

      if (!shouldUpdateIdea && !promptChanged) {
        toast.info("No changes to save");
      }

      setOpen(false);
      refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save idea changes";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex-row! flex items-center text-muted-foreground px-2 py-1 hover:bg-muted-foreground/10 rounded-md w-full my-1 gap-2 cursor-default">
        <Edit className="mr-2 h-4 w-4" />
        <span className="text-foreground">Edit</span>
      </DialogTrigger>

      <DialogContent className="max-h-full overflow-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
          <DialogDescription>
            Update your title, summary, and original prompt.
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
                  prev ? { ...prev, title: e.target.value } : null,
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
                  prev ? { ...prev, summary: e.target.value } : null,
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt">Original Prompt</Label>
            <Textarea
              id="prompt"
              rows={6}
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              placeholder="Describe your original idea prompt"
            />
          </div>
          <div className="flex items-start gap-2 rounded-md border p-3">
            <input
              id="rerun-research"
              type="checkbox"
              checked={triggerResearch}
              onChange={(e) => setTriggerResearch(e.target.checked)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="rerun-research" className="font-medium">
                Re-run AI research after saving
              </Label>
              <p className="text-xs text-muted-foreground">
                {triggerResearch
                  ? "Pipeline will reprocess this idea with the updated prompt."
                  : "Updates prompt history only (no re-research)."}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              refetch();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateIdea.isPending || updatePrompt.isPending}
          >
            {(updateIdea.isPending || updatePrompt.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {triggerResearch ? "Save & Re-run" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
