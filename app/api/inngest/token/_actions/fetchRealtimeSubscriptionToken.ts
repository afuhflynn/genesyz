"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { inngest } from "@/lib/inngest/client";

export async function fetchRealtimeSubscriptionToken(
  ideaId: string,
): Promise<{ key: string; apiBaseUrl?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const api = (inngest as unknown as Record<string, unknown>).inngestApi as {
    getSubscriptionToken: (
      channel: string,
      topics: string[],
    ) => Promise<string>;
  };

  const key = await api.getSubscriptionToken(`idea:${ideaId}`, [
    "research.started",
    "research.progress",
    "research.finished",
    "parse.idea",
  ]);

  return { key };
}
