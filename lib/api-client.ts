/**
 * =================================
 * IdeasVault API Client
 * Centralized API interface for all backend calls
 * =================================
 */

import type {
  Entitlement,
  Idea,
  IdeaInput,
  IdeaScore,
  ResearchPacket,
  User,
} from "@prisma/client";
import { privateAxios, publicAxios } from "@/config/axios.config";

// ===========================================
// Types
// ===========================================

export interface IdeaWithDetails extends Idea {
  inputs: IdeaInput[];
  scores: IdeaScore[];
  researchPackets: ResearchPacket[];
}

export interface PromptVersion {
  id: string;
  ideaId: string;
  prompt: string;
  editedAt: string;
  triggeredResearch: boolean;
  editedBy: string | null;
}

export interface PromptHistoryResponse {
  originalPrompt: string | null;
  interpretedPrompt: string | null;
  versions: PromptVersion[];
}

export interface CreateIdeaInput {
  text?: string;
  audioFile?: File;
  imageFile?: File;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  query?: string;
  archived?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserWithEntitlement extends User {
  entitlements: Entitlement[];
  _count: {
    ideas: number;
  };
}
export interface DashboardData {
  totalIdeas: number;
  researchedIdeas: number;
  averageScore: number;
  recentIdeas: IdeaWithDetails[];
  topIdeas: IdeaWithDetails[];
  usage: {
    activeIdeas: number;
    maxIdeas: number;
  };
}

export interface UserProfile extends User {
  entitlement: Entitlement | null;
  _count: {
    ideas: number;
  };
}

// ===========================================
// API Request Helper
// ===========================================

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function apiRequest<T>(
  endpoint: string,
  options: {
    method: HttpMethod;
    body?: unknown;
    isPublic?: boolean;
  },
): Promise<T> {
  const axios = options.isPublic ? publicAxios : privateAxios;

  try {
    let response;

    switch (options.method) {
      case "GET":
        response = await axios.get<T>(endpoint);
        break;
      case "DELETE":
        response = await axios.delete<T>(endpoint);
        break;
      case "POST":
        response = await axios.post<T>(endpoint, options.body ?? {});
        break;
      case "PUT":
        response = await axios.put<T>(endpoint, options.body ?? {});
        break;
      case "PATCH":
        response = await axios.patch<T>(endpoint, options.body ?? {});
        break;
      default:
        throw new Error(`Invalid HTTP method: ${options.method}`);
    }

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
    }
    throw new Error("An unexpected error occurred");
  }
}

// ===========================================
// API Methods
// ===========================================

export const api = {
  queries: {
    // Ideas
    ideas: {
      getAll: (
        params?: PaginationParams,
      ): Promise<PaginatedResponse<IdeaWithDetails>> =>
        apiRequest(
          `/ideas?page=${params?.page || 1}&limit=${params?.limit || 10}${
            params?.query ? `&query=${params.query}` : ""
          }${params?.archived ? `&archived=${params.archived}` : ""}`,
          { method: "GET" },
        ),

      getById: (id: string): Promise<IdeaWithDetails> =>
        apiRequest(`/ideas/${id}`, { method: "GET" }),

      getResearchPackets: (id: string): Promise<ResearchPacket[]> =>
        apiRequest(`/ideas/${id}/research`, { method: "GET" }),

      getPromptHistory: (id: string): Promise<PromptHistoryResponse> =>
        apiRequest(`/ideas/${id}/prompt`, { method: "GET" }),
    },

    // Dashboard
    dashboard: {
      getData: (): Promise<DashboardData> =>
        apiRequest("/dashboard", { method: "GET" }),
    },

    // User Profile
    profile: {
      get: (): Promise<UserProfile> =>
        apiRequest("/user/profile", { method: "GET" }),

      getEntitlement: (): Promise<Entitlement | null> =>
        apiRequest("/user/entitlement", { method: "GET" }),
    },

    // Billing
    billing: {
      getSubscription: (): Promise<{
        subscription: unknown;
        usage: { activeIdeas: number; maxIdeas: number };
      }> => apiRequest("/billing/subscription", { method: "GET" }),

      getCheckoutUrl: (planId: string): Promise<{ url: string }> =>
        apiRequest(`/billing/checkout?plan=${planId}`, { method: "GET" }),
    },

    // Admin
    admin: {
      getStats: (): Promise<{
        totalUsers: number;
        totalIdeas: number;
        totalResearched: number;
      }> => apiRequest("/admin/stats", { method: "GET" }),

      getUsers: (
        params?: PaginationParams & { search?: string },
      ): Promise<PaginatedResponse<UserWithEntitlement>> =>
        apiRequest(
          `/admin/users?page=${params?.page || 1}&limit=${params?.limit || 20}${
            params?.search ? `&search=${params.search}` : ""
          }`,
          { method: "GET" },
        ),

      getAuditLogs: (
        params?: PaginationParams,
      ): Promise<PaginatedResponse<unknown>> =>
        apiRequest(
          `/admin/audit-logs?page=${params?.page || 1}&limit=${
            params?.limit || 50
          }`,
          { method: "GET" },
        ),
    },

    // Startups
    startups: {
      getAll: (params?: PaginationParams) =>
        apiRequest<{
          data: unknown[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>(`/startups?page=${params?.page || 1}&limit=${params?.limit || 10}`, {
          method: "GET",
        }),
      getById: (id: string) =>
        apiRequest<unknown>(`/startups/${id}`, { method: "GET" }),
      getUpdates: (id: string, params?: PaginationParams) =>
        apiRequest<{
          data: unknown[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>(
          `/startups/${id}/updates?page=${params?.page || 1}&limit=${params?.limit || 10}`,
          { method: "GET" },
        ),
      getStreak: (id: string) =>
        apiRequest<{
          currentStreak: number;
          longestStreak: number;
          lastUpdateWeek: string | null;
          streakStartDate: string | null;
          isAtRisk: boolean;
          nextMilestone: number;
          weeksToMilestone: number;
        }>(`/startups/${id}/streak`, { method: "GET" }),
      checkSlug: (slug: string) =>
        apiRequest<{ available: boolean }>("/startups/check-slug", {
          method: "POST",
          body: { slug },
        }),
      getIdeaStartup: (ideaId: string) =>
        apiRequest<{
          hasStartup: boolean;
          startup: { id: string; slug: string; name: string } | null;
        }>(`/ideas/${ideaId}/startup`, { method: "GET" }),
    },
  },

  mutations: {
    // Ideas
    ideas: {
      create: async (data: FormData): Promise<Idea> => {
        // use the inbuild fetch api to send (because it may contain files and axios won't handle it well)
        const response = await fetch("/api/ideas", {
          method: "POST",
          body: data,
        });
        if (response.status === 201) {
          return (await response.json()) as Idea;
        } else {
          const result = await response.json();
          if (result.error) {
            throw new Error(result.error);
          }
          throw new Error("Failed to create idea");
        }
      },

      update: (
        id: string,
        data: { title?: string; summary?: string },
      ): Promise<Idea> =>
        apiRequest(`/ideas/${id}`, { method: "PATCH", body: data }),

      archive: (id: string): Promise<Idea> =>
        apiRequest(`/ideas/${id}`, {
          method: "PATCH",
          body: { isArchived: true },
        }),

      unarchive: (id: string): Promise<Idea> =>
        apiRequest(`/ideas/${id}`, {
          method: "PATCH",
          body: { isArchived: false },
        }),

      delete: (id: string): Promise<{ success: boolean }> =>
        apiRequest(`/ideas/${id}`, { method: "DELETE" }),

      rerunResearch: (id: string): Promise<{ success: boolean }> =>
        apiRequest(`/ideas/${id}/research`, { method: "POST" }),

      exportPdf: (id: string): Promise<{ url: string }> =>
        apiRequest(`/ideas/${id}/export`, { method: "POST" }),

      updatePrompt: (
        id: string,
        data: { prompt: string; triggerResearch: boolean },
      ): Promise<{
        success: boolean;
        researchTriggered: boolean;
      }> => apiRequest(`/ideas/${id}/prompt`, { method: "PUT", body: data }),
    },

    // Assets
    assets: {
      delete: (id: string): Promise<{ success: boolean }> =>
        apiRequest(`/assets/${id}`, { method: "DELETE" }),
    },

    // Profile
    profile: {
      update: (data: { name?: string; image?: string }): Promise<User> =>
        apiRequest("/user/profile", { method: "PATCH", body: data }),
    },

    // Auth
    auth: {
      forgotPassword: (email: string): Promise<{ success: boolean }> =>
        apiRequest("/auth/custom/forgot-password", {
          method: "POST",
          body: { email },
        }),

      resetPassword: (
        password: string,
        token: string,
      ): Promise<{ success: boolean }> =>
        apiRequest("/auth/custom/reset-password", {
          method: "PUT",
          body: { password, token },
        }),

      verifyEmail: (code: string): Promise<{ success: boolean }> =>
        apiRequest("/auth/custom/verify-email", {
          method: "POST",
          body: { code },
        }),

      resendVerification: (email: string): Promise<{ success: boolean }> =>
        apiRequest("/auth/custom/resend-verification-email", {
          method: "PUT",
          body: { email },
        }),
    },

    // Startups
    startups: {
      create: (data: Record<string, unknown>) =>
        apiRequest<unknown>("/startups", { method: "POST", body: data }),
      update: (id: string, data: Record<string, unknown>) =>
        apiRequest<unknown>(`/startups/${id}`, { method: "PATCH", body: data }),
      delete: (id: string) =>
        apiRequest<{ success: boolean }>(`/startups/${id}`, {
          method: "DELETE",
        }),
      createWeeklyUpdate: (id: string, data: Record<string, unknown>) =>
        apiRequest<unknown>(`/startups/${id}/updates`, {
          method: "POST",
          body: data,
        }),
      updateWeeklyUpdate: (
        id: string,
        data: {
          updateId: string;
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
        },
      ) =>
        apiRequest<unknown>(`/startups/${id}/updates`, {
          method: "PATCH",
          body: data,
        }),
      updateStreak: (
        id: string,
        data: { weekNumber: number; weekStart: Date },
      ) =>
        apiRequest<unknown>(`/startups/${id}/streak`, {
          method: "POST",
          body: data,
        }),
      getApplications: (id: string, status?: string) =>
        apiRequest<{ data: any[] }>(
          `/startups/${id}/applications${status ? `?status=${status}` : ""}`,
          { method: "GET" },
        ),
      createApplication: (
        id: string,
        data: {
          title: string;
          description?: string;
          url?: string;
          organization?: string;
          type?: string;
          deadline?: string;
        },
      ) =>
        apiRequest<unknown>(`/startups/${id}/applications`, {
          method: "POST",
          body: data,
        }),
      updateApplication: (
        id: string,
        data: {
          applicationId: string;
          status?: string;
          notes?: string;
          appliedAt?: string;
        },
      ) =>
        apiRequest<unknown>(`/startups/${id}/applications`, {
          method: "PATCH",
          body: data,
        }),
      deleteApplication: (id: string, applicationId: string) =>
        apiRequest<{ success: boolean }>(
          `/startups/${id}/applications?applicationId=${applicationId}`,
          { method: "DELETE" },
        ),
    },
  },
};
