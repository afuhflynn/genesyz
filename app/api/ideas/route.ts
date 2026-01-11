import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { ajAI } from "@/lib/arcjet";
import { inngest } from "@/lib/inngest/client";
import { isAllowedToCreateIdea } from "@/lib/polar/entitlements";

// GET /api/ideas - List all ideas for the authenticated user
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const query = searchParams.get("query");
  const archived = searchParams.get("archived") === "true";

  const skip = (page - 1) * limit;

  let where = { userId: session.user.id, isArchived: archived } as any;
  if (query && typeof query === "string" && query.trim() !== "") {
    where.OR = [
      {
        summary: {
          contains: query as string,
          mode: "insensitive",
        },
      },
      {
        title: {
          contains: query as string,
          mode: "insensitive",
        },
      },
    ];
  }

  const [ideas, total] = await Promise.all([
    db.idea.findMany({
      where: { ...where },
      include: {
        inputs: true,
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        researchPackets: true,
        researchJobs: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.idea.count({
      where: { ...where },
    }),
  ]);

  return NextResponse.json({
    data: ideas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check for AI generation
  const decision = await ajAI.protect(request, {
    userId: session.user.id,
    requested: 1,
  });
  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  // Check entitlement
  const entitlementCheck = await isAllowedToCreateIdea(session.user.id);
  if (!entitlementCheck.allowed) {
    return NextResponse.json(
      { error: entitlementCheck.reason },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const text = formData.get("text") as string | null;
  const audioData = formData.get("audio") as string | null;
  const imageData = formData.get("image") as string | null;

  // Validate at least one input is provided
  if (!text && !audioData && !imageData) {
    return NextResponse.json(
      { error: "At least one input (text, audio, or image) is required" },
      { status: 400 }
    );
  }

  // Create the idea
  const idea = await db.idea.create({
    data: {
      userId: session.user.id,
      status: "PENDING",
    },
  });

  // Process and store inputs
  const inputs: Array<{
    ideaId: string;
    type: "TEXT" | "AUDIO" | "IMAGE";
    content?: string;
    fileUrl?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
  }> = [];

  // Text input
  if (text) {
    inputs.push({
      ideaId: idea.id,
      type: "TEXT",
      content: text,
    });
  }

  // Audio input
  if (audioData) {
    try {
      const audio = JSON.parse(audioData);
      inputs.push({
        ideaId: idea.id,
        type: "AUDIO",
        fileUrl: audio.url,
        fileName: audio.name,
        mimeType: audio.type,
        fileSize: audio.size,
      });
    } catch (e) {
      console.error("Failed to parse audio data", e);
    }
  }

  // Image input
  if (imageData) {
    try {
      const image = JSON.parse(imageData);
      inputs.push({
        ideaId: idea.id,
        type: "IMAGE",
        fileUrl: image.url,
        fileName: image.name,
        mimeType: image.type,
        fileSize: image.size,
      });
    } catch (e) {
      console.error("Failed to parse image data", e);
    }
  }

  // Save all inputs
  await db.ideaInput.createMany({ data: inputs });

  // Trigger research pipeline via Inngest
  await inngest.send({
    name: "idea.submitted",
    data: {
      ideaId: idea.id,
      userId: session.user.id,
    },
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "idea.created",
      resource: "idea",
      resourceId: idea.id,
      metadata: {
        inputTypes: inputs.map((i) => i.type),
      },
    },
  });

  // Return the created idea with inputs
  const createdIdea = await db.idea.findUnique({
    where: { id: idea.id },
    include: { inputs: true },
  });

  return NextResponse.json(createdIdea, { status: 201 });
}
