import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { inngest } from "@/lib/inngest/client";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("ideaId");

  if (!ideaId) {
    return new NextResponse("Missing ideaId", { status: 400 });
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
  ]);

  return NextResponse.json({
    token: {
      key,
      channel: `idea:${ideaId}`,
      topics: ["research.started", "research.progress", "research.finished"],
    },
  });
}
