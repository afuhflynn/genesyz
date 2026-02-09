import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface AnalyticsMetrics {
  totalIdeas: number;
  activeIdeas: number;
  averageScore: number;
  scoreChange: number;
  totalResearched: number;
  researchedChange: number;
  goVerdicts: number;
  pauseVerdicts: number;
  killVerdicts: number;
  period: string;
}

interface UseAnalyticsOptions {
  period?: "week" | "month";
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { period = "week" } = options;

  return useQuery({
    queryKey: ["analytics", "dashboard", period],
    queryFn: async (): Promise<AnalyticsMetrics> => {
      const response = await fetch(`/api/analytics/dashboard?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface OnboardingStatus {
  showOnboarding: boolean;
  ideaCount: number;
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ["onboarding", "status"],
    queryFn: async (): Promise<OnboardingStatus> => {
      const response = await fetch("/api/onboarding/status");
      if (!response.ok) {
        throw new Error("Failed to fetch onboarding status");
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/onboarding/status", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "status"] });
    },
  });
}
