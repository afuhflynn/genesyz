import { Skeleton } from "../ui/skeleton";

export function IdeaDetailSkeleton() {
  return (
    <div className="space-y-8 ">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
      </div>
      <Skeleton className="h-125" />
    </div>
  );
}
