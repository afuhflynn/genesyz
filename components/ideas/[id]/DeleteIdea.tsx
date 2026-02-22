"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteIdea, useIdeaStartup, useIdeas } from "@/hooks";
import { searchParamsSchema } from "@/nuqs";

interface DeleteIdeaDialogProps {
  id: string;
  redirect?: string;
  archived?: boolean;
}

export const DeleteIdeaDialog = ({
  id,
  redirect,
  archived = false,
}: DeleteIdeaDialogProps) => {
  const deleteIdea = useDeleteIdea();
  const router = useRouter();
  const [params] = useQueryStates(searchParamsSchema);
  const [open, setOpen] = useState(false);
  const { refetch } = useIdeas({
    page: parseInt(params.page, 10),
    limit: parseInt(params.limit, 10),
    query: params.search as string,
    archived: archived,
  });

  const { data: startupData } = useIdeaStartup(id);
  const hasStartup = startupData?.hasStartup ?? false;

  const handleDelete = () => {
    if (!id) return;
    deleteIdea.mutate(id as string, {
      onSuccess: () => {
        refetch();
        if (redirect) {
          router.push(redirect);
        }
      },
    });
  };

  if (hasStartup) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full">
              <button
                type="button"
                disabled
                className="text-muted-foreground/50 flex items-center gap-2 px-2 py-1 rounded-md w-full my-1 cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p>
              This idea has an active startup. Delete or archive the startup
              first to delete this idea.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        className="text-destructive focus:text-destructive flex-row! flex items-center px-2 py-1 hover:bg-muted-foreground/10 rounded-md w-full my-1 gap-2 cursor-default"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </DialogTrigger>
      {id && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
            <DialogDescription className="space-y-2">
              This action cannot be undone. This will permanently delete your
              idea along with all research data, scores, and associated files.
              <br />
              <br />
              <strong className="text-destructive">
                All associated data will be permanently removed from our
                servers.
              </strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteIdea.isPending}
              variant="destructive"
            >
              {deleteIdea.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
