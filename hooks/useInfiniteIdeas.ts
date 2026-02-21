import { useInfiniteQuery } from "@tanstack/react-query";
import {
  api,
  type IdeaWithDetails,
  type PaginatedResponse,
} from "@/lib/api-client";

interface UseInfiniteIdeasParams {
  query?: string;
  archived?: boolean;
  limit?: number;
}

export function useInfiniteIdeas(params: UseInfiniteIdeasParams = {}) {
  const { query, archived, limit = 10 } = params;

  return useInfiniteQuery<
    PaginatedResponse<IdeaWithDetails>,
    Error,
    {
      pages: PaginatedResponse<IdeaWithDetails>[];
      pageParams: number[];
    },
    readonly [
      "ideas",
      "infinite",
      { query?: string; archived?: boolean; limit?: number },
    ],
    number
  >({
    queryKey: ["ideas", "infinite", { query, archived, limit }] as const,
    queryFn: async ({ pageParam }) => {
      return api.queries.ideas.getAll({
        page: pageParam,
        limit,
        query,
        archived,
      });
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
