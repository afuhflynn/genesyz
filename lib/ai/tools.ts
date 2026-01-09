import { z } from "zod";
import { tool } from "ai";
import { tavily } from "@tavily/core";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

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
    const client = tavily({
      apiKey: TAVILY_API_KEY,
    });

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

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        topic: "news",
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavily API error: ${error}`);
    }

    return response.json();
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

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        max_results: 3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tavily API error: ${error}`);
    }

    return response.json();
  },
});

export const tools = {
  webSearch,
  getIndustryNews,
  getCompetitorUpdates,
};
