import { getSubscriptionToken } from "inngest";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
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

  // Generate a token for the specific idea channel
  const token = await getSubscriptionToken(inngest, {
    channel: `idea:${ideaId}`,
    topics: ["research.started", "research.progress", "research.finished"],
  });

  console.log({ token });
  return NextResponse.json({ token });
}
