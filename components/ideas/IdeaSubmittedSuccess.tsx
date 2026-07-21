"use client";

import { LayoutDashboard, Lightbulb, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ResearchPipelineProgress } from "./research-pipeline-progress";

interface IdeaSubmittedSuccessProps {
  onReset?: () => void;
  ideaId?: string;
}

export function IdeaSubmittedSuccess({
  onReset,
  ideaId,
}: IdeaSubmittedSuccessProps) {
  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-none">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {ideaId ? (
          <ResearchPipelineProgress ideaId={ideaId} />
        ) : (
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Research Started</h2>
            <p className="text-sm text-muted-foreground">
              Your idea is now being analyzed by our AI agents
            </p>
          </div>
        )}

        {onReset && (
          <Button variant="ghost" className="w-full" onClick={onReset}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit Another Idea
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
