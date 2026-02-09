"use client";

import { ChevronDown, ChevronUp, Edit2, History, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeTime } from "@/lib/utils";

interface PromptVersion {
  id: string;
  prompt: string;
  editedAt: string;
  triggeredResearch: boolean;
}

interface PromptViewerProps {
  ideaId: string;
  originalPrompt: string | null;
  interpretedPrompt: string | null;
  versions: PromptVersion[];
  onEdit: (newPrompt: string, triggerResearch: boolean) => Promise<void>;
}

export function PromptViewer({
  originalPrompt,
  interpretedPrompt,
  versions,
  onEdit,
}: PromptViewerProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(originalPrompt || "");
  const [triggerResearch, setTriggerResearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!editedPrompt.trim()) return;

    setIsSubmitting(true);
    try {
      await onEdit(editedPrompt, triggerResearch);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Original Idea
            </CardTitle>
            <CardDescription>
              What you submitted vs how the AI understood it
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Prompt */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Your Original Submission
          </h4>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm whitespace-pre-wrap">
              {originalPrompt || "No original prompt available"}
            </p>
          </div>
        </div>

        {/* AI Interpretation */}
        {interpretedPrompt && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI Interpretation
            </h4>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{interpretedPrompt}</p>
            </div>
          </div>
        )}

        {/* Version History */}
        {versions.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <History className="h-4 w-4" />
              Version History ({versions.length})
              {showVersions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showVersions && (
              <ScrollArea className="h-[200px] mt-3">
                <div className="space-y-2">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={cn(
                        "p-3 rounded-lg border text-sm",
                        index === 0
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/50 border-muted",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(version.editedAt)}
                        </span>
                        {version.triggeredResearch && (
                          <Badge variant="secondary" className="text-xs">
                            Re-researched
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-3">{version.prompt}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Your Idea</DialogTitle>
            <DialogDescription>
              Update your original prompt. You can choose to re-run research or
              just save the changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              placeholder="Describe your idea..."
              className="min-h-[150px]"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="triggerResearch"
                checked={triggerResearch}
                onChange={(e) => setTriggerResearch(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="triggerResearch" className="text-sm">
                Re-run AI research with updated prompt
              </label>
            </div>

            {triggerResearch && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                This will delete all current research and start fresh. This
                action cannot be undone.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editedPrompt.trim() || isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : triggerResearch
                  ? "Save & Re-research"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
