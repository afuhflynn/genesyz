import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ajAI, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { detectBestLocation, validateLocation } from "@/lib/location";
import { isAllowedToCreateIdea } from "@/lib/polar/entitlements";
import { consumeAICredit } from "@/lib/polar/workspace-entitlements";
import { extractUrlsFromSources, sanitizeUrlStrings } from "@/lib/scraping";

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

  const where = { userId: session.user.id, isArchived: archived } as any;
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
  const decision = await checkRateLimit(request, session.user.id, ajAI);
  if (decision) return rateLimitResponse(decision);

  // Check entitlement
  const entitlementCheck = await isAllowedToCreateIdea(session.user.id);
  console.log({ entitlementCheck });
  if (!entitlementCheck.allowed) {
    return NextResponse.json(
      { error: entitlementCheck.reason },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const text = formData.get("text") as string | null;
  const audioData = formData.get("audio") as string | null;
  const imageData = formData.get("image") as string | null;
  const targetLocationRaw = formData.get("targetLocation");
  const transcription = formData.get("transcription") as string | null;
  const ocrText = formData.get("ocrText") as string | null;

  type TargetLocationInput = {
    continent?: string;
    continentCode?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    regionCode?: string;
    city?: string;
    isGlobal?: boolean;
  };

  let targetLocation: string | null = null;
  let targetLocationInput: TargetLocationInput | null = null;

  if (typeof targetLocationRaw === "string" && targetLocationRaw.trim()) {
    const raw = targetLocationRaw.trim();
    try {
      const parsed = JSON.parse(raw) as TargetLocationInput;
      if (parsed && typeof parsed === "object") {
        targetLocationInput = parsed;
        targetLocation = parsed.isGlobal
          ? "Global"
          : [parsed.city, parsed.region, parsed.country, parsed.continent]
              .filter(Boolean)
              .join(", ");
      }
    } catch {
      targetLocation = raw;
    }
  }

  const MAX_TEXT_LENGTH = 10000;

  if (text && text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters (${text.length} characters provided)`,
      },
      { status: 400 },
    );
  }

  // Validate at least one input is provided
  if (!text && !audioData && !imageData) {
    return NextResponse.json(
      { error: "At least one input (text, audio, or image) is required" },
      { status: 400 },
    );
  }

  // Build original prompt from all text sources
  const originalPrompt = text || transcription || ocrText || "";

  // Extract URLs from text sources
  const extractedUrls = extractUrlsFromSources({
    text: text || undefined,
    transcription: transcription || undefined,
    ocrText: ocrText || undefined,
  });
  const urlStrings = sanitizeUrlStrings(extractedUrls);

  // Detect or validate location
  let locationContext = null;
  if (targetLocationInput) {
    if (targetLocationInput.isGlobal) {
      locationContext = {
        country: "Global",
        countryCode: "GLOBAL",
        isGlobal: true,
      };
    } else if (targetLocationInput.country) {
      locationContext = {
        country: targetLocationInput.country,
        countryCode: targetLocationInput.countryCode || "UNKNOWN",
        region: targetLocationInput.region,
        regionCode: targetLocationInput.regionCode,
        city: targetLocationInput.city,
        isGlobal: false,
      };
    } else if (targetLocationInput.continent) {
      locationContext = {
        country: targetLocationInput.continent,
        countryCode: targetLocationInput.continentCode || "CONTINENT",
        isGlobal: false,
      };
    }
  } else if (targetLocation) {
    // User provided location
    const validation = await validateLocation(targetLocation);
    if (validation.isValid) {
      locationContext = validation.context;
    }
  } else {
    // Try to detect from text or IP
    const requestHeaders = await headers();
    const ipAddress = requestHeaders.get("x-forwarded-for") || undefined;

    const detectedLocation = await detectBestLocation({
      textContent: originalPrompt,
      ipAddress: ipAddress?.split(",")[0]?.trim(),
    });

    locationContext = detectedLocation.context;
  }

  const aiCredit = await consumeAICredit(session.user.id);
  if (!aiCredit.allowed) {
    return NextResponse.json(
      { error: "Your workspace has no AI credits remaining." },
      { status: 402 },
    );
  }

  // Create the idea with prompt and location data
  const idea = await db.idea.create({
    data: {
      userId: session.user.id,
      status: "PENDING",
      originalPrompt: originalPrompt || null,
      extractedUrls: urlStrings,
      targetLocation: targetLocation || locationContext?.country || null,
      locationContext: locationContext ? (locationContext as any) : null,
    },
  });

  // Process and store inputs
  const inputs: Array<{
    ideaId: string;
    type: "TEXT" | "AUDIO" | "IMAGE";
    content?: string;
    transcription?: string;
    ocrText?: string;
    fileUrl?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    extractedUrls: string[];
  }> = [];

  // Text input
  if (text) {
    const textUrls = extractUrlsFromSources({ text });
    inputs.push({
      ideaId: idea.id,
      type: "TEXT",
      content: text,
      extractedUrls: sanitizeUrlStrings(textUrls),
    });
  }

  // Audio input
  if (audioData) {
    try {
      const audio = JSON.parse(audioData);
      const audioUrls = transcription
        ? sanitizeUrlStrings(extractUrlsFromSources({ transcription }))
        : [];
      inputs.push({
        ideaId: idea.id,
        type: "AUDIO",
        fileUrl: audio.url,
        fileName: audio.name,
        mimeType: audio.type,
        fileSize: audio.size,
        transcription: transcription || undefined,
        extractedUrls: audioUrls,
      });
    } catch (e) {
      console.error("Failed to parse audio data", e);
    }
  }

  // Image input
  if (imageData) {
    try {
      const image = JSON.parse(imageData);
      const imageUrls = ocrText
        ? sanitizeUrlStrings(extractUrlsFromSources({ ocrText }))
        : [];
      inputs.push({
        ideaId: idea.id,
        type: "IMAGE",
        fileUrl: image.url,
        fileName: image.name,
        mimeType: image.type,
        fileSize: image.size,
        ocrText: ocrText || undefined,
        extractedUrls: imageUrls,
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
