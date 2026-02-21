/**
 * =================================
 * IdeasVault React Query Hooks
 * Type-safe data fetching with caching
 * =================================
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  api,
  type IdeaWithDetails,
  type PaginationParams,
} from "@/lib/api-client";
import { authClient, signIn, signUp } from "@/lib/auth-client";

// ===========================================
// Query Keys Factory
// ===========================================

export const queryKeys = {
  ideas: {
    all: ["ideas"] as const,
    list: (params?: PaginationParams) =>
      [...queryKeys.ideas.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.ideas.all, "detail", id] as const,
    research: (id: string) => [...queryKeys.ideas.all, "research", id] as const,
  },
  startups: {
    all: ["startups"] as const,
    list: (params?: PaginationParams) =>
      [...queryKeys.startups.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.startups.all, "detail", id] as const,
    updates: (id: string) =>
      [...queryKeys.startups.all, "updates", id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    data: () => [...queryKeys.dashboard.all, "data"] as const,
  },
  profile: {
    all: ["profile"] as const,
    user: () => [...queryKeys.profile.all, "user"] as const,
    entitlement: () => [...queryKeys.profile.all, "entitlement"] as const,
  },
  billing: {
    all: ["billing"] as const,
    subscription: () => [...queryKeys.billing.all, "subscription"] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    users: (params?: PaginationParams & { search?: string }) =>
      [...queryKeys.admin.all, "users", params] as const,
    auditLogs: (params?: PaginationParams) =>
      [...queryKeys.admin.all, "audit-logs", params] as const,
  },
};

// ===========================================
// Ideas Hooks
// ===========================================

export function useIdeas(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.ideas.list(params),
    queryFn: () => api.queries.ideas.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: queryKeys.ideas.detail(id),
    queryFn: () => api.queries.ideas.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIdeaResearch(id: string) {
  return useQuery({
    queryKey: queryKeys.ideas.research(id),
    queryFn: () => api.queries.ideas.getResearchPackets(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - research doesn't change often
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => api.mutations.ideas.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Idea submitted! Research will begin shortly.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create idea");
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; summary?: string };
    }) => api.mutations.ideas.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(id) });
      toast.success("Idea updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update idea");
    },
  });
}

export function useArchiveIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.mutations.ideas.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(id) });
      toast.success("Idea archived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive idea");
    },
  });
}
export function useUnArchiveIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.mutations.ideas.unarchive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(id) });
      toast.success("Idea unarchived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unarchive idea");
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.mutations.ideas.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("Idea deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete idea");
    },
  });
}

export function useRerunResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.mutations.ideas.rerunResearch(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(id) });
      toast.success("Research restarted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restart research");
    },
  });
}

export function useExportIdeaPdf() {
  return useMutation({
    mutationFn: (id: string) => api.mutations.ideas.exportPdf(id),
    onSuccess: (data) => {
      // Open the PDF URL in a new tab
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast.success("PDF generated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate PDF");
    },
  });
}

// ===========================================
// Dashboard Hooks
// ===========================================

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.data(),
    queryFn: () => api.queries.dashboard.getData(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export {
  useAnalytics,
  useCompleteOnboarding,
  useOnboardingStatus,
} from "./useAnalytics";

// ===========================================
// Profile Hooks
// ===========================================

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.user(),
    queryFn: () => api.queries.profile.get(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useEntitlement() {
  return useQuery({
    queryKey: queryKeys.profile.entitlement(),
    queryFn: () => api.queries.profile.getEntitlement(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; image?: string }) =>
      api.mutations.profile.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      toast.success("Profile updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// ===========================================
// Billing Hooks
// ===========================================

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription(),
    queryFn: () => api.queries.billing.getSubscription(),
    staleTime: 5 * 60 * 1000,
  });
}

// ===========================================
// Admin Hooks
// ===========================================

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => api.queries.admin.getStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAdminUsers(params?: PaginationParams & { search?: string }) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => api.queries.admin.getUsers(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useAdminAuditLogs(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => api.queries.admin.getAuditLogs(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ===========================================
// Auth Hooks
// ===========================================

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.mutations.auth.forgotPassword(email),
    onSuccess: () => {
      toast.success("Reset link sent if account exists");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset link");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ password, token }: { password: string; token: string }) =>
      api.mutations.auth.resetPassword(password, token),
    onSuccess: () => {
      toast.success("Password reset successful");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (code: string) => api.mutations.auth.verifyEmail(code),
    onSuccess: () => {
      toast.success("Email verified successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid or expired code");
    },
  });
}

export function useMagicLink() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Magic link sent! Check your email.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send magic link");
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => api.mutations.auth.resendVerification(email),
    onSuccess: () => {
      toast.success("Verification email resent");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend email");
    },
  });
}

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: any) => signIn.email(data),
    onSuccess: (response: any) => {
      if (response.error) {
        toast.error(response.error.message || "Login failed");
      } else {
        toast.success("Login successful");
        router.push("/dashboard");
        router.refresh();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await signUp.email(data);
      if (error) {
        throw new Error(error?.message);
      }
    },
    onSuccess(_data, variables) {
      toast.success("Registration successful! Please verify your email.");
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });
}

// ===========================================
// Startup Hooks
// ===========================================

export interface StartupWithDetails {
  id: string;
  ideaId: string;
  userId: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  stage: string;
  targetMarket: string | null;
  logoUrl: string | null;
  website: string | null;
  location: string | null;
  isLaunched: boolean;
  launchDate: Date | null;
  weeksToLaunch: number | null;
  primaryMetricType: string;
  primaryMetricValue: number | null;
  primaryMetricTarget: number | null;
  currentWeekNumber: number;
  lastUpdateAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  idea: IdeaWithDetails & { scores: Array<{ overallScore: number | null }> };
  weeklyUpdates: Array<{
    id: string;
    weekNumber: number;
    weekStart: Date;
    weekEnd: Date;
    isLaunched: boolean;
    weeksToLaunch: number | null;
    usersTalkedTo: number;
    userLearnings: string | null;
    primaryMetricType: string;
    primaryMetricValue: number;
    primaryMetricDelta: number | null;
    moraleScore: number;
    topImprovements: string | null;
    biggestObstacle: string | null;
    aiAnalysis: any;
    aiVerdict: string | null;
    aiRecommendations: any;
    goals: Array<{ content: string; completed: boolean; priority: number }>;
  }>;
  goals: Array<{
    id: string;
    content: string;
    completed: boolean;
    dueDate: Date | null;
  }>;
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    target: number | null;
  }>;
  _count: { weeklyUpdates: number };
}

export interface WeeklyUpdateWithGoals {
  id: string;
  startupId: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  isLaunched: boolean;
  weeksToLaunch: number | null;
  usersTalkedTo: number;
  userLearnings: string | null;
  primaryMetricType: string;
  primaryMetricValue: number;
  primaryMetricDelta: number | null;
  moraleScore: number;
  topImprovements: string | null;
  biggestObstacle: string | null;
  aiAnalysis: any;
  aiVerdict: string | null;
  aiRecommendations: any;
  createdAt: Date;
  goals: Array<{
    id: string;
    content: string;
    priority: number;
    completed: boolean;
  }>;
}

export function useStartups(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.startups.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10),
      });
      const response = await fetch(`/api/startups?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch startups");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStartup(id: string) {
  return useQuery({
    queryKey: queryKeys.startups.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/startups/${id}`);
      if (!response.ok) throw new Error("Failed to fetch startup");
      return response.json() as Promise<StartupWithDetails>;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyUpdates(startupId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.startups.updates(startupId),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10),
      });
      const response = await fetch(
        `/api/startups/${startupId}/updates?${queryParams}`,
      );
      if (!response.ok) throw new Error("Failed to fetch weekly updates");
      return response.json() as Promise<{
        data: WeeklyUpdateWithGoals[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>;
    },
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckSlug() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch("/api/startups/check-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Failed to check slug");
      return response.json() as Promise<{ available: boolean }>;
    },
  });
}

export function useCreateStartup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: {
      ideaId: string;
      name: string;
      slug: string;
      tagline?: string;
      description?: string;
      industry?: string;
      stage?: string;
      targetMarket?: string;
      logoUrl?: string;
      website?: string;
      location?: string;
    }) => {
      const response = await fetch("/api/startups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create startup");
      }
      return response.json();
    },
    onSuccess: (startup) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      toast.success("Startup profile created!");
      router.push(`/startups/${startup.slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create startup");
    },
  });
}

export function useUpdateStartup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      const response = await fetch(`/api/startups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update startup");
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.startups.detail(id),
      });
      toast.success("Startup updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update startup");
    },
  });
}

export function useDeleteStartup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/startups/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete startup");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups.all });
      toast.success("Startup archived");
      router.push("/startups");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive startup");
    },
  });
}

export function useCreateWeeklyUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      startupId,
      data,
    }: {
      startupId: string;
      data: {
        isLaunched: boolean;
        weeksToLaunch?: number | null;
        usersTalkedTo: number;
        userLearnings: string;
        primaryMetricType: string;
        primaryMetricValue: number;
        moraleScore: number;
        topImprovements?: string;
        biggestObstacle?: string;
        goals: Array<{
          content: string;
          priority: number;
          completed?: boolean;
        }>;
      };
    }) => {
      const response = await fetch(`/api/startups/${startupId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create weekly update");
      }
      return response.json();
    },
    onSuccess: (_, { startupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.startups.detail(startupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.startups.updates(startupId),
      });
      toast.success("Weekly update submitted!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit weekly update");
    },
  });
}
