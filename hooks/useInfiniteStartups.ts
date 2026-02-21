import { useInfiniteQuery } from "@tanstack/react-query";
import type { StartupWithDetails } from "./index";

interface PaginatedStartupsResponse {
  data: StartupWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseInfiniteStartupsParams {
  limit?: number;
}

export function useInfiniteStartups(params: UseInfiniteStartupsParams = {}) {
  const { limit = 10 } = params;

  return useInfiniteQuery<
    PaginatedStartupsResponse,
    Error,
    {
      pages: PaginatedStartupsResponse[];
      pageParams: number[];
    },
    readonly ["startups", "infinite", { limit?: number }],
    number
  >({
    queryKey: ["startups", "infinite", { limit }] as const,
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });
      const response = await fetch(`/api/startups?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch startups");
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}
