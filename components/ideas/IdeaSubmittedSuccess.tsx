"use client";

import {
  CheckCircle,
  LayoutDashboard,
  Lightbulb,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IdeaSubmittedSuccessProps {
  onReset?: () => void;
}

export function IdeaSubmittedSuccess({ onReset }: IdeaSubmittedSuccessProps) {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-xl">Research Started</CardTitle>
        <CardDescription>
          Your idea is now being analyzed by our AI agents
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            What happens next:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Market research and competitor analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Feasibility and execution assessment
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Trend and timing analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Final score and recommendations
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            This typically takes{" "}
            <span className="font-medium text-foreground">2-3 minutes</span>.
            We'll email you when your research is complete.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild variant="default" className="flex-1">
            <Link href="/ideas">
              <Lightbulb className="mr-2 h-4 w-4" />
              View My Ideas
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

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
