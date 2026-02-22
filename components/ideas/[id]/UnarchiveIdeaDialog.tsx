"use client";

import { ArchiveRestore, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUnArchiveIdea } from "@/hooks";

interface UnarchiveIdeaDialogProps {
  id: string;
  title?: string | null;
  children?: React.ReactNode;
}

export function UnarchiveIdeaDialog({
  id,
  title,
  children,
}: UnarchiveIdeaDialogProps) {
  const unarchiveIdea = useUnArchiveIdea();
  const [open, setOpen] = useState(false);

  const handleUnarchive = async () => {
    await unarchiveIdea.mutateAsync(id);
    setOpen(false);
  };

  const ideaName = title || "this idea";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <button
            type="button"
            className="text-sm flex items-center gap-2 px-2 py-1 hover:bg-muted-foreground/10 rounded-md w-full cursor-default"
          >
            <ArchiveRestore className="h-4 w-4" />
            Restore
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore "{ideaName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will return the idea to your main dashboard. All your research
            data and scores remain intact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={unarchiveIdea.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnarchive}
            disabled={unarchiveIdea.isPending}
          >
            {unarchiveIdea.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Restore Idea
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
