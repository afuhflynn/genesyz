import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";

// constants
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

const client = tavily({
  apiKey: TAVILY_API_KEY,
});
const search_depth = "advanced";

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

    return {
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
    };
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
            researchPackets: true,
            scores: true,
          },
        },
        weeklyUpdates: {
          orderBy: { weekNumber: "desc" },
          take: 4,
          include: { goals: true },
        },
        goals: {
          orderBy: { priority: "asc" },
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

    return {
      id: startup.id,
      name: startup.name,
      tagline: startup.tagline,
      description: startup.description,
      industry: startup.industry,
      stage: startup.stage,
      targetMarket: startup.targetMarket,
      isLaunched: startup.isLaunched,
      idea: {
        title: startup.idea.title,
        summary: startup.idea.summary,
        research: startup.idea.researchPackets.map((p) => ({
          type: p.agentType,
          content: p.content,
        })),
        score: startup.idea.scores[0],
      },
      weeklyUpdates: startup.weeklyUpdates,
      goals: startup.goals,
      metrics: startup.metrics,
      tasks: startup.tasks,
      members: startup.members.map((m) => ({
        name: m.user.name,
        role: m.role,
      })),
      followersCount: startup.followers.length,
    };
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
};
