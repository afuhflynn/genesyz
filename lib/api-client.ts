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
// Task Types
// ===========================================

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export interface TaskItem {
  id: string;
  startupId: string;
  listId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: TaskStatus;
  position: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  startupId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks: TaskItem[];
}

export interface StartupOpportunity {
  id: string;
  startupId: string;
  title: string;
  description: string;
  url: string;
  category: string;
  eligibility: string | null;
  benefits: string | null;
  deadline: string | null;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programType: string;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  durationWeeks: number | null;
  benefits: string | null;
  requirements: string | null;
  maxStartups: number | null;
  fundingAmount: string | null;
  isPublic: boolean;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner: { id: string; name: string | null; image: string | null };
  cohorts: Array<{
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    _count: { startups: number };
  }>;
  _count: { applications: number; cohorts: number };
}

export interface AcceleratorWithDetails extends Accelerator {
  owner: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

export interface AcceleratorApplication {
  id: string;
  acceleratorId: string;
  startupId: string | null;
  founderEmail: string;
  founderName: string;
  founderPhone: string | null;
  status: string;
  notes: string | null;
  answers: Record<string, unknown> | null;
  appliedAt: Date;
  updatedAt: Date;
  startup: { id: string; name: string; slug: string } | null;
}

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

export type StartupMemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface StartupMember {
  id: string;
  userId: string;
  role: StartupMemberRole;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  isOwner: boolean;
}

export interface StartupFollower {
  id: string;
  startupId: string;
  email: string;
  name: string | null;
  createdAt: Date;
  createdBy: string | null;
}

export interface SearchedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
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
    let response: { data: T };

    switch (options.method) {
      case "GET":
        response = await axios.get<T>(endpoint);
        break;
      case "DELETE":
        response = await axios.delete<T>(endpoint, {
          data: options.body ?? undefined,
        });
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
      getTaskLists: (id: string, status?: TaskStatus) =>
        apiRequest<{ data: { lists: TaskList[] } }>(
          `/startups/${id}/applications${status ? `?status=${status}` : ""}`,
          { method: "GET" },
        ),
      getOpportunities: (
        id: string,
        params?: { status?: string; category?: string },
      ) => {
        const query = new URLSearchParams();

        if (params?.status) {
          query.set("status", params.status);
        }

        if (params?.category) {
          query.set("category", params.category);
        }

        const queryString = query.toString();

        return apiRequest<{ data: StartupOpportunity[] }>(
          `/startups/${id}/opportunities${queryString ? `?${queryString}` : ""}`,
          { method: "GET" },
        );
      },
      generateOpportunities: (id: string) =>
        apiRequest<{
          data: Array<{
            title: string;
            description: string;
            url?: string;
            category: string;
            eligibility?: string;
            benefits?: string;
            deadline?: string | null;
          }>;
          meta?: {
            usedTavilySearch: boolean;
            searchWarning?: string;
          };
        }>(`/startups/${id}/opportunities/generate`, { method: "POST" }),
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
      getMembers: (id: string) =>
        apiRequest<{ data: StartupMember[] }>(`/startups/${id}/members`, {
          method: "GET",
        }),
      searchUsers: (query: string, excludeStartup?: string) =>
        apiRequest<{ data: SearchedUser[] }>(
          `/users/search?q=${encodeURIComponent(query)}${
            excludeStartup ? `&excludeStartup=${excludeStartup}` : ""
          }`,
          { method: "GET" },
        ),
      getFollowers: (id: string) =>
        apiRequest<{ data: StartupFollower[] }>(`/startups/${id}/followers`, {
          method: "GET",
        }),
    },

    // Accelerators
    accelerators: {
      getAll: (params?: { publicOnly?: boolean }) =>
        apiRequest<{ data: Accelerator[] }>(
          `/accelerators${params?.publicOnly ? "?public=true" : ""}`,
          { method: "GET" },
        ),
      getBySlug: (slug: string) =>
        apiRequest<{ data: AcceleratorWithDetails }>(`/accelerators/${slug}`, {
          method: "GET",
        }),
      checkSlug: (name: string) => {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        return apiRequest<{ available: boolean }>("/accelerators/check-slug", {
          method: "POST",
          body: { slug },
        });
      },
      apply: (
        slug: string,
        data: {
          founderEmail: string;
          founderName: string;
          founderPhone?: string;
          startupId?: string;
          answers?: Record<string, string>;
        },
      ) =>
        apiRequest<AcceleratorApplication>(`/accelerators/${slug}/apply`, {
          method: "POST",
          body: data,
        }),
      getApplications: (slug: string) =>
        apiRequest<{ data: AcceleratorApplication[] }>(
          `/accelerators/${slug}/apply`,
          { method: "GET" },
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
      getTaskLists: (id: string, status?: TaskStatus) =>
        apiRequest<{ data: { lists: TaskList[] } }>(
          `/startups/${id}/applications${status ? `?status=${status}` : ""}`,
          { method: "GET" },
        ),
      createTaskList: (
        id: string,
        data: {
          name: string;
        },
      ) =>
        apiRequest<unknown>(`/startups/${id}/applications`, {
          method: "POST",
          body: {
            action: "create_list",
            ...data,
          },
        }),
      renameTaskList: (
        id: string,
        data: {
          listId: string;
          name: string;
        },
      ) =>
        apiRequest<unknown>(`/startups/${id}/applications`, {
          method: "PATCH",
          body: {
            action: "rename_list",
            ...data,
          },
        }),
      deleteTaskList: (id: string, listId: string) =>
        apiRequest<{ success: boolean }>(`/startups/${id}/applications`, {
          method: "DELETE",
          body: {
            action: "delete_list",
            listId,
          },
        }),
      createTask: (
        id: string,
        data: {
          listId: string;
          title: string;
          description?: string;
          deadline?: string;
          status?: TaskStatus;
        },
      ) =>
        apiRequest<{ data: TaskItem }>(`/startups/${id}/applications`, {
          method: "POST",
          body: {
            action: "create_task",
            ...data,
          },
        }),
      updateTask: (
        id: string,
        data: {
          taskId: string;
          title?: string;
          description?: string;
          deadline?: string | null;
        },
      ) =>
        apiRequest<{ success: boolean }>(`/startups/${id}/applications`, {
          method: "PATCH",
          body: {
            action: "update_task",
            ...data,
          },
        }),
      moveTask: (
        id: string,
        data: {
          taskId: string;
          listId: string;
          status: TaskStatus;
          position?: number;
        },
      ) =>
        apiRequest<{ success: boolean }>(`/startups/${id}/applications`, {
          method: "PATCH",
          body: {
            action: "move_task",
            ...data,
          },
        }),
      deleteTask: (id: string, taskId: string) =>
        apiRequest<{ success: boolean }>(`/startups/${id}/applications`, {
          method: "DELETE",
          body: {
            action: "delete_task",
            taskId,
          },
        }),
      createOpportunity: (
        id: string,
        data: {
          title: string;
          description: string;
          url: string;
          category: string;
          eligibility?: string;
          benefits?: string;
          deadline: string;
          status?: string;
        },
      ) =>
        apiRequest<StartupOpportunity>(`/startups/${id}/opportunities`, {
          method: "POST",
          body: data,
        }),
      updateOpportunity: (
        id: string,
        data: {
          opportunityId: string;
          status?: string;
          notes?: string;
          title?: string;
          description?: string;
        },
      ) =>
        apiRequest<StartupOpportunity>(`/startups/${id}/opportunities`, {
          method: "PATCH",
          body: data,
        }),
      deleteOpportunity: (id: string, opportunityId: string) =>
        apiRequest<{ success: boolean }>(
          `/startups/${id}/opportunities?opportunityId=${opportunityId}`,
          { method: "DELETE" },
        ),
      addMember: (
        id: string,
        data: { userId: string; role?: StartupMemberRole },
      ) =>
        apiRequest<{ data: StartupMember }>(`/startups/${id}/members`, {
          method: "POST",
          body: data,
        }),
      updateMember: (
        id: string,
        memberId: string,
        data: { role: StartupMemberRole },
      ) =>
        apiRequest<{ data: StartupMember }>(
          `/startups/${id}/members/${memberId}`,
          {
            method: "PATCH",
            body: data,
          },
        ),
      removeMember: (id: string, memberId: string) =>
        apiRequest<{ success: boolean }>(
          `/startups/${id}/members/${memberId}`,
          { method: "DELETE" },
        ),
      addFollower: (id: string, data: { email: string; name?: string }) =>
        apiRequest<{ data: StartupFollower }>(`/startups/${id}/followers`, {
          method: "POST",
          body: data,
        }),
      removeFollower: (id: string, followerId: string) =>
        apiRequest<{ success: boolean }>(
          `/startups/${id}/followers/${followerId}`,
          { method: "DELETE" },
        ),
    },

    // Accelerators
    accelerators: {
      create: (data: {
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
      }) =>
        apiRequest<Accelerator>("/accelerators", {
          method: "POST",
          body: data,
        }),
      update: (
        slug: string,
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
        }>,
      ) =>
        apiRequest<Accelerator>(`/accelerators/${slug}`, {
          method: "PATCH",
          body: data,
        }),
      delete: (slug: string) =>
        apiRequest<{ success: boolean }>(`/accelerators/${slug}`, {
          method: "DELETE",
        }),
    },
  },
};
