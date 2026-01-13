"use client";

import { Edit, Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
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
import { useIdeas, useUpdateIdea } from "@/hooks";
import type { IdeaWithDetails } from "@/lib/api-client";
import { searchParamsSchema } from "@/nuqs";

export const EditIdeaDialog = ({
  id,
  title,
  summary,
  archived = true,
}: {
  id: string;
  summary: string;
  title: string;
  archived?: boolean;
}) => {
  const updateIdea = useUpdateIdea();
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

  useEffect(() => {
    setEditingIdea({
      id,
      title,
      summary,
    });
  }, [setEditingIdea, id, title, summary]);

  const handleUpdate = () => {
    if (!editingIdea) return;
    updateIdea.mutate(
      {
        id: editingIdea.id as string,
        data: {
          title: editingIdea.title as string,
          summary: editingIdea.summary as string,
        },
      },
      {
        onSuccess: () => {
          setEditingIdea(null);
          refetch();
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger className="flex-row! flex items-center text-muted-foreground px-2 py-1 hover:bg-muted-foreground/10 rounded-md w-full my-1 gap-2 cursor-default">
        <Edit className="mr-2 h-4 w-4" />
        <span className="text-foreground">Edit</span>
      </DialogTrigger>

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
          <Button onClick={handleUpdate} disabled={updateIdea.isPending}>
            {updateIdea.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
