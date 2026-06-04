// ex. /app/actions/get-subscribe-token.ts
"use server";
import { getSubscriptionToken, type Realtime } from "inngest";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { inngest } from "@/lib/inngest/client";
import type { ideaChannel } from "@/lib/inngest/channels";

export type UserChannelToken = Realtime.Token<
  typeof ideaChannel,
  ["research.started", "research.progress", "research.finished", "parse.idea"]
>;

export async function fetchRealtimeSubscriptionToken(
  ideaId: string,
): Promise<UserChannelToken> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // This creates a token using the Inngest API that is bound to the channel and topic:
  const token = await getSubscriptionToken(inngest, {
    channel: `idea:${ideaId}`,
    topics: [
      "research.started",
      "research.progress",
      "research.finished",
      "parse.idea",
    ],
  });

  return token as any;
}
