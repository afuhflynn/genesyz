"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isFetching?: boolean;
}

export function InfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isFetching,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetching &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground text-sm">
        No more items to load
      </div>
    );
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-8">
      {isFetchingNextPage && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading more...</span>
        </div>
      )}
    </div>
  );
}
