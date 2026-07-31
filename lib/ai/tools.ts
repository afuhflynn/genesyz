import {
  OpportunityCategory,
  PrimaryMetricType,
  StartupStage,
  Task,
} from "@prisma/client";
import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";

// constants
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

const client = tavily({
  apiKey: TAVILY_API_KEY,
});
const search_depth = "advanced";

function toJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  query: string;
  answer: string;
  results: TavilySearchResult[];
}

export async function searchWithTavily(
  query: string,
  options: {
    searchDepth?: "basic" | "advanced";
    maxResults?: number;
  } = {},
): Promise<TavilySearchResponse> {
  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set");
  }

  const response = await client.search(query, {
    searchDepth: options.searchDepth || search_depth,
    includeAnswer: true,
    maxResults: options.maxResults ?? 5,
  });

  if (!response) {
    throw new Error("No response from Tavily API");
  }

  return {
    query,
    answer: response.answer ?? "",
    results: (response.results ?? []).map((result) => ({
      title: result.title ?? "",
      url: result.url ?? "",
      content: result.content ?? "",
      score: result.score ?? 0,
    })),
  };
}

/**
 * Web search tool
 */

export const webSearch = tool({
  description:
    "Search the web for real-time information, market data, and competitors.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    searchDepth: z
      .enum(["basic", "advanced"])
      .default("basic")
      .describe("The depth of the search"),
  }),
  execute: async ({ query, searchDepth }) => {
    const response = await searchWithTavily(query, {
      searchDepth,
      maxResults: 5,
    });

    return response.results;
  },
});

export const getIndustryNews = tool({
  description:
    "Get the latest news and updates for a specific industry or startup category.",
  inputSchema: z.object({
    category: z
      .string()
      .describe(
        "The industry or startup category (e.g., fintech, ai, healthcare)",
      ),
    daysBack: z
      .number()
      .default(7)
      .describe("How many days back to search for news"),
  }),
  execute: async ({ category, daysBack }) => {
    const query = `latest news and trends in ${category} startup ecosystem last ${daysBack} days`;

    const response = await searchWithTavily(query, {
      searchDepth: search_depth,
      maxResults: 5,
    });

    return response.results;
  },
});

export const getCompetitorUpdates = tool({
  description:
    "Get recent updates, funding news, or product launches for specific competitors.",
  inputSchema: z.object({
    competitorName: z.string().describe("The name of the competitor"),
  }),
  execute: async ({ competitorName }) => {
    const query = `${competitorName} startup latest news funding product launch 2024 2025`;

    const response = await searchWithTavily(query, {
      searchDepth: search_depth,
      maxResults: 3,
    });

    return response.results;
  },
});

export const getIdeaContext = tool({
  description:
    "Get the full context of an idea, including research and history.",
  inputSchema: z.object({
    ideaId: z.string().describe("The ID of the idea"),
  }),
  execute: async ({ ideaId }) => {
    const { db } = await import("@/lib/db");
    const idea = await db.idea.findUnique({
      where: { id: ideaId },
      include: {
        researchPackets: true,
        scores: true,
        snapshots: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
    });

    if (!idea) throw new Error("Idea not found");

    return toJson({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      founderGoals: idea.founderGoals,
      assumptions: idea.assumptions,
      research: idea.researchPackets.map((p) => ({
        type: p.agentType,
        content: p.content,
      })),
      scores: idea.scores[0],
      history: idea.snapshots,
    });
  },
});

export const updateIdeaState = tool({
  description: "Update the founder goals or assumptions for an idea.",
  inputSchema: z.object({
    ideaId: z.string().describe("The ID of the idea"),
    founderGoals: z.array(z.string()).optional(),
    assumptions: z.any().optional(), // JSON array of assumptions
  }),
  execute: async ({ ideaId, founderGoals, assumptions }) => {
    const { db } = await import("@/lib/db");
    const updatedIdea = await db.idea.update({
      where: { id: ideaId },
      data: {
        ...(founderGoals && { founderGoals }),
        ...(assumptions && { assumptions }),
      },
    });
    return { success: true, ideaId: updatedIdea.id };
  },
});

export const saveVerdict = tool({
  description: "Save a weekly verdict and state snapshot for an idea.",
  inputSchema: z.object({
    ideaId: z.string().describe("The ID of the idea"),
    state: z.any().describe("The full state JSON"),
    verdict: z.any().describe("The verdict JSON (Go/Pause/Kill, etc.)"),
  }),
  execute: async ({ ideaId, state, verdict }) => {
    const { db } = await import("@/lib/db");
    const snapshot = await db.ideaSnapshot.create({
      data: {
        ideaId,
        state,
        verdict,
      },
    });
    return { success: true, snapshotId: snapshot.id };
  },
});

export const addStartupTask = tool({
  description: "Add a task to a task list",
  inputSchema: z.object({
    startupId: z.string(),
    listId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    deadline: z.string().optional(),
  }),

  execute: async ({ startupId, listId, title, description, deadline }) => {
    const { db } = await import("@/lib/db");

    const task = await db.task.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,

        startup: { connect: { id: startupId } },
        list: { connect: { id: listId } },
      },
    });

    return toJson(task);
  },
});

export const replaceAllStartupTasks = tool({
  description: "Replace all tasks for a startup.",
  inputSchema: z.object({
    startupId: z.string().describe("The ID of the startup"),
    tasks: z.array(z.any()).describe("The tasks to replace with"),
  }),
  execute: async ({
    startupId,
    tasks,
  }: {
    startupId: string;
    tasks: Task[];
  }) => {
    const { db } = await import("@/lib/db");
    const startup = await db.startup.findUnique({
      where: { id: startupId },
      include: {
        tasks: true,
      },
    });

    if (!startup) throw new Error("Startup not found");

    // Delete existing tasks
    await db.task.deleteMany({
      where: {
        startupId,
      },
    });

    // Create new tasks
    await db.task.createMany({
      data: tasks,
      skipDuplicates: true,
    });

    return { success: true };
  },
});

export const createStartupTaskList = tool({
  description: "Create a new task list",
  inputSchema: z.object({
    startupId: z.string(),
    title: z.string(),
  }),
  execute: async ({ startupId, title }) => {
    const { db } = await import("@/lib/db");

    const list = await db.taskList.create({
      data: {
        startupId,
        name: title,
      },
    });

    return toJson(list); // return ID!
  },
});

export const getStartupTaskLists = tool({
  description: "Get the task lists for a startup.",
  inputSchema: z.object({
    startupId: z.string().describe("The ID of the startup"),
  }),
  execute: async ({ startupId }) => {
    const { db } = await import("@/lib/db");
    const startup = await db.startup.findUnique({
      where: { id: startupId },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        stage: true,
        slug: true,
        ideaId: true,
      },
    });

    if (!startup) {
      throw new Error("Startup not found");
    }

    // Get task lists
    const taskLists = await db.taskList.findMany({
      where: {
        startupId,
      },
    });

    return toJson(taskLists);
  },
});

export const getStartupContext = tool({
  description:
    "Get the full context of a startup, including updates, tasks, goals, and metrics.",
  inputSchema: z.object({
    startupId: z.string().describe("The ID of the startup"),
  }),
  execute: async ({ startupId }) => {
    const { db } = await import("@/lib/db");
    const startup = await db.startup.findUnique({
      where: { id: startupId },
      include: {
        idea: {
          include: {
            researchPackets: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            scores: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        weeklyUpdates: {
          orderBy: { weekNumber: "desc" },
          take: 4,
          include: { goals: true },
        },
        metrics: true,
        tasks: {
          orderBy: { position: "asc" },
          take: 20,
        },
        members: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        followers: true,
      },
    });

    if (!startup) throw new Error("Startup not found");

    return toJson({
      id: startup.id,
      name: startup.name,
      tagline: startup.tagline,
      description: startup.description,
      industry: startup.industry,
      stage: startup.stage,
      targetMarket: startup.targetMarket,
      isLaunched: startup.isLaunched,
      idea: startup.idea
        ? {
            title: startup.idea.title,
            summary: startup.idea.summary,
            research: startup.idea.researchPackets.map((p) => ({
              type: p.agentType,
              content: p.content,
            })),
            score: startup.idea.scores[0],
          }
        : null,
      weeklyUpdates: startup.weeklyUpdates,
      metrics: startup.metrics,
      tasks: startup.tasks,
      members: startup.members.map((m) => ({
        name: m.user.name,
        role: m.role,
      })),
      followersCount: startup.followers.length,
    });
  },
});

export const updateStartupTaskList = tool({
  description: "Update an existing task list's name or position.",
  inputSchema: z.object({
    listId: z.string().describe("The ID of the task list to update"),
    title: z.string().optional().describe("The new name for the task list"),
    position: z
      .number()
      .optional()
      .describe("The new position index for the task list (for reordering)"),
  }),
  execute: async ({ listId, title, position }) => {
    const { db } = await import("@/lib/db");

    const updatedList = await db.taskList.update({
      where: { id: listId },
      data: {
        ...(title && { name: title }),
        ...(position !== undefined && { position }),
      },
    });

    return toJson(updatedList);
  },
});

export const updateStartupMetrics = tool({
  description: "Update or set primary and secondary metrics for a startup.",
  inputSchema: z.object({
    startupId: z.string(),
    primaryMetricType: z.nativeEnum(PrimaryMetricType).optional(),
    primaryMetricValue: z.number().optional(),
    primaryMetricTarget: z.number().optional(),
    stage: z.nativeEnum(StartupStage).optional(),
  }),
  execute: async ({ startupId, ...data }) => {
    const { db } = await import("@/lib/db");
    return toJson(
      await db.startup.update({
        where: { id: startupId },
        data,
      }),
    );
  },
});

export const addWeeklyUpdate = tool({
  description:
    "Submit a weekly progress report, including morale, blockers, and user learnings.",
  inputSchema: z.object({
    startupId: z.string(),
    weekNumber: z.number(),
    usersTalkedTo: z.number(),
    userLearnings: z.string(),
    moraleScore: z.number().min(1).max(10),
    primaryMetricValue: z.number(),
    biggestObstacle: z.string().optional(),
  }),
  execute: async ({ startupId, ...updateData }) => {
    const { db } = await import("@/lib/db");
    // Calculate week dates automatically
    const weekStart = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    return toJson(
      await db.weeklyUpdate.create({
        data: {
          ...updateData,
          weekStart,
          weekEnd,
          startup: { connect: { id: startupId } },
        },
      }),
    );
  },
});

// --- OPPORTUNITY & ACCELERATOR TOOLS ---

export const trackOpportunity = tool({
  description:
    "Log a funding, grant, or accelerator opportunity for the startup.",
  inputSchema: z.object({
    startupId: z.string(),
    title: z.string(),
    url: z.string().url(),
    category: z.nativeEnum(OpportunityCategory),
    deadline: z.string().optional(),
    description: z.string().optional(), // Zod allows undefined here...
  }),
  execute: async ({ startupId, deadline, description, ...details }) => {
    const { db } = await import("@/lib/db");
    return toJson(
      await db.startupOpportunity.create({
        data: {
          ...details,
          description: description ?? "", // ...so we fall back to "" for Prisma
          deadline: deadline ? new Date(deadline) : null,
          startup: { connect: { id: startupId } },
        },
      }),
    );
  },
});

export const getAcceleratorContext = tool({
  description: "Get details on an accelerator and its active cohorts.",
  inputSchema: z.object({
    slug: z.string().describe("The unique slug of the accelerator"),
  }),
  execute: async ({ slug }) => {
    const { db } = await import("@/lib/db");
    return toJson(
      await db.accelerator.findUnique({
        where: { slug },
        include: {
          cohorts: { where: { isActive: true } },
          events: { take: 5, orderBy: { scheduledAt: "asc" } },
        },
      }),
    );
  },
});

// --- FEED & INSIGHTS ---

export const createResearchFeedItem = tool({
  description:
    "Inject a critical insight, reminder, or report into the founder's research feed.",
  inputSchema: z.object({
    startupId: z.string(),
    title: z.string(),
    summary: z.string(),
    type: z.enum([
      "IDEA_RESEARCH",
      "WEEKLY_REPORT",
      "WEEKLY_DIGEST",
      "WEEKLY_REMINDER",
    ]),
    content: z.any().optional(),
  }),
  execute: async (data) => {
    const { db } = await import("@/lib/db");
    return toJson(await db.researchFeedItem.create({ data }));
  },
});

export const tools = {
  webSearch,
  getIndustryNews,
  getCompetitorUpdates,
  getIdeaContext,
  getStartupContext,
  updateIdeaState,
  saveVerdict,
  addStartupTask,
  replaceAllStartupTasks,
  createStartupTaskList,
  getStartupTaskLists,
  updateStartupTaskList,
  addWeeklyUpdate,
  trackOpportunity,
  getAcceleratorContext,
  createResearchFeedItem,
};
