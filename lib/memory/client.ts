const MEM0_API_KEY = process.env.MEM0_API_KEY;
const MEM0_API_URL = process.env.MEM0_API_URL || "https://api.mem0.ai/v1";

type MemoryFilters = {
  userId?: string | null;
  startupId?: string | null;
  conversationId?: string | null;
};

type MemoryResult = {
  id: string;
  memory: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
  categories?: string[];
};

function buildFilters(filters: MemoryFilters): Record<string, string> {
  const result: Record<string, string> = {};
  if (filters.userId) result.user_id = filters.userId;
  if (filters.startupId) result.agent_id = filters.startupId;
  if (filters.conversationId) result.run_id = filters.conversationId;
  return result;
}

function isEnabled(): boolean {
  return !!MEM0_API_KEY;
}

export async function searchMemories(
  query: string,
  filters: MemoryFilters,
): Promise<MemoryResult[]> {
  if (!isEnabled()) return [];

  try {
    const response = await fetch(`${MEM0_API_URL}/memories/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${MEM0_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        ...buildFilters(filters),
        top_k: 10,
      }),
    });

    if (!response.ok) {
      console.warn("[MEM0] Search failed:", response.status);
      return [];
    }

    const data = await response.json();
    return data.results || data || [];
  } catch (error) {
    console.warn("[MEM0] Search error:", error);
    return [];
  }
}

export async function addMemories(
  messages: { role: string; content: string }[],
  filters: MemoryFilters,
): Promise<boolean> {
  if (!isEnabled()) return false;

  try {
    const response = await fetch(`${MEM0_API_URL}/memories/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${MEM0_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        ...buildFilters(filters),
      }),
    });

    if (!response.ok) {
      console.warn("[MEM0] Add failed:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[MEM0] Add error:", error);
    return false;
  }
}

export function formatMemoriesForPrompt(memories: MemoryResult[]): string {
  if (memories.length === 0) return "";

  const lines = memories.map((m) => `- ${m.memory}`);
  return [
    "",
    "RELEVANT MEMORIES FROM PAST CONVERSATIONS:",
    ...lines,
    "",
  ].join("\n");
}

export { isEnabled as isMemoryEnabled };
