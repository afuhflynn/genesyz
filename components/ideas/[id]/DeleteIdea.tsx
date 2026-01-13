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
import { useDeleteIdea, useIdea, useIdeas } from "@/hooks";
import { searchParamsSchema } from "@/nuqs";

export const DeleteIdeaDialog = ({
  id,
  redirect,
  archived = true,
}: {
  id: string;
  redirect?: string;
  archived?: boolean;
}) => {
  const deleteIdea = useDeleteIdea();
  const router = useRouter();
  const [params] = useQueryStates(searchParamsSchema);
  const [open, setOpen] = useState(false);
  const { refetch } = useIdeas({
    page: parseInt(params.page),
    limit: parseInt(params.limit),
    query: params.search as string,
    archived: archived,
  });

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

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger className="text-destructive focus:text-destructive flex-row! flex items-center px-2 py-1 hover:bg-muted-foreground/10 rounded-md w-full my-1 gap-2 cursor-default">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DialogTrigger>
      {id && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this idea?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen((prev) => !prev)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteIdea.isPending}
              variant={"destructive"}
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
