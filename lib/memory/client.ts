import { type Memory, MemoryClient, type Message } from "mem0ai";

const MEM0_API_KEY = process.env.MEM0_API_KEY?.replace(/[^\x20-\x7E]/g, "");

let client: MemoryClient | null = null;
let clientInitError: unknown = null;

function getClient(): MemoryClient | null {
  if (!MEM0_API_KEY) return null;
  if (!client && !clientInitError) {
    try {
      client = new MemoryClient({ apiKey: MEM0_API_KEY });
    } catch (error) {
      clientInitError = error;
      const err = error as Error & { cause?: unknown };
      console.warn(
        "[MEM0] Client init error:",
        err.message,
        "stack:",
        err.stack?.split("\n").slice(0, 3).join(" | "),
      );
    }
  }
  return client;
}

export function isMemoryEnabled(): boolean {
  return getClient() !== null;
}

export type MemoryFilters = {
  userId?: string | null;
  startupId?: string | null;
  conversationId?: string | null;
};

export type MemoryResult = {
  id: string;
  memory: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
  categories?: string[];
};

function memoryToResult(m: Memory): MemoryResult {
  return {
    id: m.id,
    memory: m.memory ?? m.data?.memory ?? "",
    score: m.score,
    created_at:
      m.createdAt instanceof Date
        ? m.createdAt.toISOString()
        : (m.createdAt as string | undefined),
    updated_at:
      m.updatedAt instanceof Date
        ? m.updatedAt.toISOString()
        : (m.updatedAt as string | undefined),
    categories: m.categories,
  };
}

function buildAddOptions(filters: MemoryFilters): Record<string, unknown> {
  const opts: Record<string, unknown> = {};
  if (filters.userId) opts.userId = filters.userId;
  if (filters.startupId) opts.agentId = filters.startupId;
  if (filters.conversationId) opts.runId = filters.conversationId;
  return opts;
}

function buildSearchFilters(filters: MemoryFilters): Record<string, string> {
  const result: Record<string, string> = {};
  if (filters.userId) result.user_id = filters.userId;
  if (filters.startupId) result.agent_id = filters.startupId;
  if (filters.conversationId) result.run_id = filters.conversationId;
  return result;
}

function formatError(method: string, error: unknown): string {
  const err = error as Error & { code?: string };
  const parts = [
    `[MEM0] ${method}:`,
    err.message,
    err.code ? `code=${err.code}` : null,
    err.stack?.split("\n").slice(0, 2).join(" | "),
  ];
  return parts.filter(Boolean).join(" ");
}

export async function searchMemories(
  query: string,
  filters: MemoryFilters,
): Promise<MemoryResult[]> {
  const c = getClient();
  if (!c) return [];

  try {
    const result = await c.search(query, {
      filters: buildSearchFilters(filters),
      topK: 10,
    });
    return (result.results ?? []).map(memoryToResult);
  } catch (error) {
    console.warn(formatError("searchMemories", error));
    return [];
  }
}

export async function addMemories(
  messages: { role: string; content: string }[],
  filters: MemoryFilters,
): Promise<boolean> {
  const c = getClient();
  if (!c) return false;

  try {
    await c.add(messages as Message[], buildAddOptions(filters));
    return true;
  } catch (error) {
    console.warn(formatError("addMemories", error));
    console.warn("[MEM0] addMemories context:", {
      messageCount: messages.length,
      filters,
    });
    return false;
  }
}

export async function updateMemories(
  memoryId: string,
  text: string,
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  const c = getClient();
  if (!c) return false;

  try {
    await c.update(memoryId, { text, metadata });
    return true;
  } catch (error) {
    console.warn(formatError("updateMemories", error));
    return false;
  }
}

export async function deleteMemories(
  memoryId: string,
  deleteLinked?: boolean,
): Promise<boolean> {
  const c = getClient();
  if (!c) return false;

  try {
    await c.delete(memoryId, deleteLinked ? { deleteLinked } : undefined);
    return true;
  } catch (error) {
    console.warn(formatError("deleteMemories", error));
    return false;
  }
}

export async function deleteAllMemories(
  filters: MemoryFilters,
): Promise<boolean> {
  const c = getClient();
  if (!c) return false;

  try {
    await c.deleteAll(buildAddOptions(filters));
    return true;
  } catch (error) {
    console.warn(formatError("deleteAllMemories", error));
    return false;
  }
}

export async function getAllMemories(
  filters: MemoryFilters,
  options?: { page?: number; pageSize?: number; categories?: string[] },
): Promise<{ memories: MemoryResult[]; total: number }> {
  const c = getClient();
  if (!c) return { memories: [], total: 0 };

  try {
    const result = await c.getAll({
      filters: buildSearchFilters(filters),
      page: options?.page,
      pageSize: options?.pageSize,
      categories: options?.categories,
    });
    return {
      memories: (result.results ?? []).map(memoryToResult),
      total: result.count,
    };
  } catch (error) {
    console.warn(formatError("getAllMemories", error));
    return { memories: [], total: 0 };
  }
}

export function formatMemoriesForPrompt(memories: MemoryResult[]): string {
  if (memories.length === 0) return "";

  const lines = memories.map((m) => `- ${m.memory}`);
  return ["", "RELEVANT MEMORIES FROM PAST CONVERSATIONS:", ...lines, ""].join(
    "\n",
  );
}
