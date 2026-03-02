"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApplicationKanban } from "@/components/startups/ApplicationKanban";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartup } from "@/hooks";

interface ApplicationsPageClientProps {
  slug: string;
}

export function ApplicationsPageClient({ slug }: ApplicationsPageClientProps) {
  const { data: startup, isLoading } = useStartup(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64 w-72" />
          ))}
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Startup not found</p>
      </div>
    );
  }

  return <ApplicationKanban startupId={startup.id} startupSlug={slug} />;
}
