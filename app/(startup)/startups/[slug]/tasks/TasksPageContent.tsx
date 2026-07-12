"use client";

import { TaskBoard } from "@/components/startups/TaskBoard";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartup } from "@/hooks";

interface TasksPageContentProps {
  slug: string;
}

export function TasksPageContent({ slug }: TasksPageContentProps) {
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

  return <TaskBoard startupId={startup.id} />;
}
