"use client";

import { useQuery } from "@tanstack/react-query";

export type WorkspaceNavigationContext = {
  organizationId: string;
  entitlement: {
    plan: string;
    capabilities: Record<string, boolean>;
  };
  usage: {
    activeStartups: number;
    maxStartups: number;
    hostedProjects: number;
  };
};

export function useWorkspaceNavigation() {
  return useQuery<WorkspaceNavigationContext>({
    queryKey: ["workspace", "navigation"],
    queryFn: async () => {
      const response = await fetch("/api/billing/workspace");
      if (!response.ok) throw new Error("Workspace details are unavailable");
      return response.json() as Promise<WorkspaceNavigationContext>;
    },
    staleTime: 5 * 60 * 1000,
  });
}
