import { tavily } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod";

// constants
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

const client = tavily({
  apiKey: TAVILY_API_KEY,
});
const search_depth = "advanced";

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
    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY is not set");
    }

    const response = await client.search(query, {
      searchDepth: searchDepth,
      includeAnswer: true,
      maxResults: 5,
    });

    if (!response) {
      throw new Error("No response from Tavily API");
    }

    response.results;

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
        "The industry or startup category (e.g., fintech, ai, healthcare)"
      ),
    daysBack: z
      .number()
      .default(7)
      .describe("How many days back to search for news"),
  }),
  execute: async ({ category, daysBack }) => {
    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY is not set");
    }

    const query = `latest news and trends in ${category} startup ecosystem last ${daysBack} days`;

    const response = await client.search(query, {
      searchDepth: search_depth,
      includeAnswer: true,
      maxResults: 5,
    });

    if (!response) {
      throw new Error("No response from Tavily API");
    }

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
    if (!TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY is not set");
    }

    const query = `${competitorName} startup latest news funding product launch 2024 2025`;

    const response = await client.search(query, {
      searchDepth: search_depth,
      includeAnswer: true,
      maxResults: 3,
    });

    if (!response) {
      throw new Error("No response from Tavily API");
    }

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

export const tools = {
  webSearch,
  getIndustryNews,
  getCompetitorUpdates,
  getIdeaContext,
  updateIdeaState,
  saveVerdict,
};
