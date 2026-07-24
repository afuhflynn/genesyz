import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajAI, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { consumeAICredit } from "@/lib/polar/workspace-entitlements";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ideas/[id]/research - Get research packets for an idea
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const idea = await db.idea.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  if (idea.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const packets = await db.researchPacket.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(packets);
}

// POST /api/ideas/[id]/research - Trigger re-run of research
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await checkRateLimit(request, session.user.id, ajAI);
  if (decision) return rateLimitResponse(decision);

  const aiCredit = await consumeAICredit(session.user.id);
  if (!aiCredit.allowed) {
    return NextResponse.json(
      { error: "Your workspace has no AI credits remaining." },
      { status: 402 },
    );
  }

  const { id } = await params;

  const idea = await db.idea.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  if (idea.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (idea.status === "PROCESSING") {
    return NextResponse.json(
      { error: "Research is already in progress" },
      { status: 400 },
    );
  }

  // Reset idea status and trigger new research
  await db.idea.update({
    where: { id },
    data: { status: "PENDING" },
  });

  // Import Inngest dynamically to avoid circular dependencies
  const { inngest } = await import("@/lib/inngest/client");

  await inngest.send({
    name: "idea.submitted",
    data: {
      ideaId: id,
      userId: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "research.rerun",
      resource: "idea",
      resourceId: id,
    },
  });

  return NextResponse.json({ success: true });
}
