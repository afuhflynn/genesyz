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
  type Accelerator,
  type AcceleratorApplication,
  type Application,
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
    prompt: (id: string) => [...queryKeys.ideas.all, "prompt", id] as const,
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

export function useIdeaPromptHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.ideas.prompt(id),
    queryFn: () => api.queries.ideas.getPromptHistory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
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

export function useUpdateIdeaPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      prompt,
      triggerResearch,
    }: {
      id: string;
      prompt: string;
      triggerResearch: boolean;
    }) => api.mutations.ideas.updatePrompt(id, { prompt, triggerResearch }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.prompt(id) });
      toast.success("Idea prompt updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update prompt");
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
  editableUntil: Date | null;
  isLocked: boolean;
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
    queryFn: () => api.queries.startups.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStartup(id: string) {
  return useQuery({
    queryKey: queryKeys.startups.detail(id),
    queryFn: () =>
      api.queries.startups.getById(id) as Promise<StartupWithDetails>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyUpdates(startupId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.startups.updates(startupId),
    queryFn: () =>
      api.queries.startups.getUpdates(startupId, params) as Promise<{
        data: WeeklyUpdateWithGoals[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>,
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStartupStreak(startupId: string) {
  return useQuery({
    queryKey: [...queryKeys.startups.detail(startupId), "streak"],
    queryFn: () => api.queries.startups.getStreak(startupId),
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckSlug() {
  return useMutation({
    mutationFn: (slug: string) => api.queries.startups.checkSlug(slug),
  });
}

export function useCreateStartup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
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
    }) => api.mutations.startups.create(data),
    onSuccess: (startup) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      toast.success("Startup profile created!");
      router.push(`/startups/${(startup as { slug: string }).slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create startup");
    },
  });
}

export function useUpdateStartup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.mutations.startups.update(id, data),
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
    mutationFn: (id: string) => api.mutations.startups.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      toast.success("Startup deleted");
      router.push("/startups");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete startup");
    },
  });
}

export function useCreateWeeklyUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
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
        metricPeriod?: string | null;
        metricFormat?: string | null;
        customMetricName?: string | null;
        additionalMetrics?: Array<{
          type: string;
          value: number;
          period?: string | null;
          customMetricName?: string | null;
        }> | null;
        previousGoalsReview?: Array<{
          goalText: string;
          completed: boolean;
        }> | null;
        goalsCompletionRate?: number | null;
        moraleScore: number;
        topImprovements?: string;
        biggestObstacle?: string;
        goals: Array<{
          content: string;
          priority: number;
          completed?: boolean;
        }>;
      };
    }) => api.mutations.startups.createWeeklyUpdate(startupId, data),
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

export function useUpdateWeeklyUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      startupId,
      updateId,
      data,
    }: {
      startupId: string;
      updateId: string;
      data: {
        isLaunched?: boolean;
        weeksToLaunch?: number | null;
        usersTalkedTo?: number;
        userLearnings?: string;
        primaryMetricType?: string;
        primaryMetricValue?: number;
        metricPeriod?: string | null;
        customMetricName?: string | null;
        moraleScore?: number;
        topImprovements?: string;
        biggestObstacle?: string;
        goals?: Array<{
          content: string;
          priority: number;
          completed?: boolean;
        }>;
      };
    }) =>
      api.mutations.startups.updateWeeklyUpdate(startupId, {
        updateId,
        ...data,
      }),
    onSuccess: (_, { startupId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.startups.detail(startupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.startups.updates(startupId),
      });
      toast.success("Weekly update saved!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save weekly update");
    },
  });
}

export function useIdeaStartup(ideaId: string) {
  return useQuery({
    queryKey: [...queryKeys.ideas.detail(ideaId), "startup"],
    queryFn: () =>
      api.queries.startups.getIdeaStartup(ideaId) as Promise<{
        hasStartup: boolean;
        startup: { id: string; slug: string; name: string } | null;
      }>,
    enabled: !!ideaId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useApplications(startupId: string) {
  return useQuery({
    queryKey: [...queryKeys.startups.detail(startupId), "applications"],
    queryFn: () => api.queries.startups.getApplications(startupId),
    enabled: !!startupId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      startupId,
      data,
    }: {
      startupId: string;
      data: {
        title: string;
        description?: string;
        url?: string;
        organization?: string;
        type?: string;
        deadline?: string;
      };
    }) => api.mutations.startups.createApplication(startupId, data),
    onSuccess: (_, { startupId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.startups.detail(startupId), "applications"],
      });
      toast.success("Application added!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add application");
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      startupId,
      data,
    }: {
      startupId: string;
      data: {
        applicationId: string;
        status?: string;
        notes?: string;
        appliedAt?: string;
      };
    }) => api.mutations.startups.updateApplication(startupId, data),
    onSuccess: (_, { startupId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.startups.detail(startupId), "applications"],
      });
      toast.success("Application updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update application");
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      startupId,
      applicationId,
    }: {
      startupId: string;
      applicationId: string;
    }) => api.mutations.startups.deleteApplication(startupId, applicationId),
    onSuccess: (_, { startupId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.startups.detail(startupId), "applications"],
      });
      toast.success("Application removed!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove application");
    },
  });
}

export function useGenerateOpportunities(startupId: string) {
  return useMutation({
    mutationFn: () => api.queries.startups.generateOpportunities(startupId),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate opportunities");
    },
  });
}

// ===========================================
// Accelerator Hooks
// ===========================================

export function useAccelerators(params?: { publicOnly?: boolean }) {
  return useQuery({
    queryKey: ["accelerators", params],
    queryFn: () => api.queries.accelerators.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAccelerator(slug: string) {
  return useQuery({
    queryKey: ["accelerators", slug],
    queryFn: () => api.queries.accelerators.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAccelerator() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      programType?: string;
      logoUrl?: string;
      website?: string;
      contactEmail?: string;
      durationWeeks?: number;
      benefits?: string;
      requirements?: string;
      maxStartups?: number;
      fundingAmount?: string;
      isPublic?: boolean;
    }) => api.mutations.accelerators.create(data),
    onSuccess: (accelerator) => {
      queryClient.invalidateQueries({ queryKey: ["accelerators"] });
      toast.success("Accelerator created!");
      router.push(`/accelerators/${accelerator.slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create accelerator");
    },
  });
}

export function useUpdateAccelerator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: Partial<{
        name: string;
        description: string;
        programType: string;
        logoUrl: string;
        website: string;
        contactEmail: string;
        durationWeeks: number;
        benefits: string;
        requirements: string;
        maxStartups: number;
        fundingAmount: string;
        isPublic: boolean;
        isActive: boolean;
      }>;
    }) => api.mutations.accelerators.update(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["accelerators"] });
      queryClient.invalidateQueries({ queryKey: ["accelerators", slug] });
      toast.success("Accelerator updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update accelerator");
    },
  });
}

export function useDeleteAccelerator() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (slug: string) => api.mutations.accelerators.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accelerators"] });
      toast.success("Accelerator deleted");
      router.push("/accelerators");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete accelerator");
    },
  });
}

export function useApplyToAccelerator(slug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      founderEmail: string;
      founderName: string;
      founderPhone?: string;
      startupId?: string;
      answers?: Record<string, string>;
    }) => api.queries.accelerators.apply(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accelerators", slug] });
      toast.success("Application submitted!");
      router.push(`/accelerators/${slug}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });
}

export function useAcceleratorApplications(slug: string) {
  return useQuery({
    queryKey: ["accelerators", slug, "applications"],
    queryFn: () => api.queries.accelerators.getApplications(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export type {
  Accelerator,
  AcceleratorApplication,
  Application,
} from "@/lib/api-client";
export { useInfiniteIdeas } from "./useInfiniteIdeas";
export { useInfiniteStartups } from "./useInfiniteStartups";
