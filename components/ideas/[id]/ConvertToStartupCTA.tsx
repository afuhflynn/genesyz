"use client";

import {
  Building2,
  CheckCircle2,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConvertToStartupCTAProps {
  ideaId: string;
  ideaTitle?: string | null;
  ideaSummary?: string | null;
  hasExistingStartup?: boolean;
}

export function ConvertToStartupCTA({
  ideaId,
  ideaTitle,
  ideaSummary,
  hasExistingStartup = false,
}: ConvertToStartupCTAProps) {
  if (hasExistingStartup) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">
                Startup Profile Created
              </p>
              <p className="text-sm text-green-700">
                This idea has been converted to a startup
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-100"
          >
            <Link href={`/startups/${ideaId}`}>View Startup</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Ready to Build?</h3>
                <p className="text-sm text-muted-foreground">
                  Turn this validated idea into an active startup
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Weekly KPI tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                <span>AI coaching & feedback</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Startup School access</span>
              </div>
            </div>
          </div>

          <Button asChild size="lg" className="shrink-0">
            <Link
              href={`/startups/new?ideaId=${ideaId}${ideaTitle ? `&name=${encodeURIComponent(ideaTitle)}` : ""}`}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Create Startup Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
