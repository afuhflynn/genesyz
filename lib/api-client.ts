/**
 * =================================
 * IdeasVault API Client
 * Centralized API interface for all backend calls
 * =================================
 */

import { privateAxios, publicAxios } from "@/config/axios.config";
import type {
  Idea,
  IdeaInput,
  IdeaScore,
  ResearchPacket,
  Entitlement,
  User,
} from "@prisma/client";

// ===========================================
// Types
// ===========================================

export interface IdeaWithDetails extends Idea {
  inputs: IdeaInput[];
  scores: IdeaScore[];
  researchPackets: ResearchPacket[];
}

export interface CreateIdeaInput {
  text?: string;
  audioFile?: File;
  imageFile?: File;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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

export interface DashboardData {
  totalIdeas: number;
  researchedIdeas: number;
  averageScore: number;
  recentIdeas: IdeaWithDetails[];
  topIdeas: IdeaWithDetails[];
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
  }
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
        params?: PaginationParams
      ): Promise<PaginatedResponse<IdeaWithDetails>> =>
        apiRequest(
          `/ideas?page=${params?.page || 1}&limit=${params?.limit || 10}`,
          { method: "GET" }
        ),

      getById: (id: string): Promise<IdeaWithDetails> =>
        apiRequest(`/ideas/${id}`, { method: "GET" }),

      getResearchPackets: (id: string): Promise<ResearchPacket[]> =>
        apiRequest(`/ideas/${id}/research`, { method: "GET" }),
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
        params?: PaginationParams & { search?: string }
      ): Promise<PaginatedResponse<User>> =>
        apiRequest(
          `/admin/users?page=${params?.page || 1}&limit=${params?.limit || 20}${
            params?.search ? `&search=${params.search}` : ""
          }`,
          { method: "GET" }
        ),

      getAuditLogs: (
        params?: PaginationParams
      ): Promise<PaginatedResponse<unknown>> =>
        apiRequest(
          `/admin/audit-logs?page=${params?.page || 1}&limit=${
            params?.limit || 50
          }`,
          { method: "GET" }
        ),
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
          throw new Error("Failed to create idea");
        }
      },

      archive: (id: string): Promise<Idea> =>
        apiRequest(`/ideas/${id}/archive`, { method: "PATCH" }),

      unarchive: (id: string): Promise<Idea> =>
        apiRequest(`/ideas/${id}/unarchive`, { method: "PATCH" }),

      delete: (id: string): Promise<{ success: boolean }> =>
        apiRequest(`/ideas/${id}`, { method: "DELETE" }),

      rerunResearch: (id: string): Promise<{ success: boolean }> =>
        apiRequest(`/ideas/${id}/research`, { method: "POST" }),

      exportPdf: (id: string): Promise<{ url: string }> =>
        apiRequest(`/ideas/${id}/export`, { method: "POST" }),
    },

    // Profile
    profile: {
      update: (data: { name?: string; image?: string }): Promise<User> =>
        apiRequest("/user/profile", { method: "PATCH", body: data }),
    },

    // Billing
    billing: {
      createCheckout: (planId: string): Promise<{ url: string }> =>
        apiRequest("/billing/checkout", { method: "POST", body: { planId } }),

      cancelSubscription: (): Promise<{ success: boolean }> =>
        apiRequest("/billing/cancel", { method: "POST" }),
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
        token: string
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
  },
};
