"use client";

import { Archive, Loader2 } from "lucide-react";
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
import { useArchiveIdea } from "@/hooks";

interface ArchiveIdeaDialogProps {
  id: string;
  title?: string | null;
  children?: React.ReactNode;
}

export function ArchiveIdeaDialog({
  id,
  title,
  children,
}: ArchiveIdeaDialogProps) {
  const archiveIdea = useArchiveIdea();
  const [open, setOpen] = useState(false);

  const handleArchive = async () => {
    await archiveIdea.mutateAsync(id);
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
            <Archive className="h-4 w-4" />
            Archive
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive "{ideaName}"?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            This will hide the idea from your main dashboard. Your research
            data, scores, and all history will be preserved.
            <br />
            <br />
            You can restore it anytime from the <strong>Archived Ideas</strong>{" "}
            section.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={archiveIdea.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={archiveIdea.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {archiveIdea.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Archive Idea
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
