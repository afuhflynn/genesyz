import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { checkWorkspaceCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

const campaignSchema = z.object({
  name: z.string().trim().min(1).max(120),
  channel: z.string().trim().min(1).max(80),
  objective: z.string().trim().max(500).optional(),
  status: z
    .enum(["DRAFT", "RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"])
    .optional(),
  budget: z.number().finite().min(0).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  personaIds: z.array(z.string()).max(50).optional(),
});

async function access(
  request: NextRequest,
  id: string,
  permission: "view_startup" | "edit_startup",
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  const result = await checkStartupAccess(id, permission);
  if (!result.hasAccess || !result.startupId)
    return {
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }),
    };
  try {
    await checkWorkspaceCapability(session.user.id, "growthOS", result.startupId);
  } catch (error) {
    const response = entitlementErrorResponse(error);
    if (response) return { response };
    throw error;
  }
  return { startupId: result.startupId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await access(request, (await params).id, "view_startup");
  if ("response" in result) return result.response;
  const campaigns = await db.growthCampaign.findMany({
    where: { startupId: result.startupId },
    include: {
      personas: { include: { persona: true } },
      experiments: true,
      events: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: campaigns });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await access(request, (await params).id, "edit_startup");
  if ("response" in result) return result.response;
  const parsed = campaignSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid campaign", details: parsed.error.flatten() },
      { status: 400 },
    );
  const { personaIds = [], startDate, endDate, ...data } = parsed.data;
  const validPersonas = personaIds.length
    ? await db.customerPersona.count({
        where: { startupId: result.startupId, id: { in: personaIds } },
      })
    : 0;
  if (validPersonas !== personaIds.length)
    return NextResponse.json(
      { error: "One or more personas were not found" },
      { status: 400 },
    );
  const campaign = await db.growthCampaign.create({
    data: {
      ...data,
      startupId: result.startupId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      personas: { create: personaIds.map((personaId) => ({ personaId })) },
    },
    include: { personas: { include: { persona: true } } },
  });
  return NextResponse.json({ data: campaign }, { status: 201 });
}
