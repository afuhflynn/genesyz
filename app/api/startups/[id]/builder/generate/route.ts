import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { streamTextWithFallback } from "@/lib/ai/stream-fallback";
import { ajAI, checkRateLimit, rateLimitResponse } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  checkWorkspaceCapability,
  entitlementErrorResponse,
  reserveWorkspaceUsage,
} from "@/lib/polar/workspace-entitlements";
import { checkStartupAccess } from "@/lib/startup-permissions";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Session check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Arcjet Rate Limiting
    const decision = await checkRateLimit(req, session.user.id, ajAI);
    if (decision) return rateLimitResponse(decision);

    // 3. Permission gate
    const { id: startupIdOrSlug } = await params;
    const access = await checkStartupAccess(startupIdOrSlug, "edit_startup");

    if (!access.hasAccess || !access.startupId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { prompt, currentCode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    await checkWorkspaceCapability(session.user.id, "builder", access.startupId);
    await reserveWorkspaceUsage(
      session.user.id,
      "builder",
      1,
      req.headers.get("x-idempotency-key") || crypto.randomUUID(),
      access.startupId,
    );

    // Load startup metadata to ground the AI context
    const startup = await db.startup.findUnique({
      where: { id: access.startupId },
    });

    const systemPrompt = `You are a world-class front-end software engineer and no-code creator (like Lovable, V0, or Bolt.new).
Your goal is to build, iterate, or modify a high-fidelity, production-grade, single-page web application or landing page based on the user's instructions.

CRITICAL INSTRUCTIONS:
1. OUTPUT ONLY THE FULL, STANDALONE HTML CODE.
2. DO NOT wrap the code in markdown blocks (e.g. do not output \`\`\`html or \`\`\`). Simply write the html directly.
3. If an existing codebase/HTML is provided under "Current Code", modify it incrementally based on the user's instructions, preserving existing functional elements unless requested otherwise.
4. Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
5. Include FontAwesome for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
6. Apply rich aesthetics: Sleek dark modes, glassmorphism (backdrop-filter), modern gradients, vibrant accents, smooth animations, and responsive flex/grid spacing.
7. Use professional placeholders (e.g. Unsplash for images: https://images.unsplash.com/photo-...).
8. Add client-side interactive JS widget logic (e.g. toggles, interactive charts, pricing calculators, mock newsletter signup alerts) so the page feels alive.

Startup details for grounding:
- Name: ${startup?.name || "Startup Idea"}
- Description: ${startup?.description || ""}

${
  currentCode
    ? `CURRENT CODE to iterate on:\n\`\`\`html\n${currentCode}\n\`\`\``
    : ""
}
`;

    // Initiate streaming using streamTextWithFallback
    const result = await streamTextWithFallback(
      {
        messages: [{ role: "user", content: prompt }],
        system: systemPrompt,
        temperature: 0.2,
      },
      "WEB_BUILDER",
    );

    return result.toTextStreamResponse();
  } catch (error) {
    const entitlementResponse = entitlementErrorResponse(error);
    if (entitlementResponse) return entitlementResponse;
    console.error("[BUILDER_GENERATE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
