import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { detectLocationFromText } from "@/lib/location";
import { extractUrlsFromSources, sanitizeUrlStrings } from "@/lib/scraping";

// GET /api/ideas/[id]/prompt - Get prompt history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;

    // Get idea with prompt versions
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
      select: {
        id: true,
        originalPrompt: true,
        interpretedPrompt: true,
        promptVersions: {
          orderBy: { editedAt: "desc" },
        },
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({
      originalPrompt: idea.originalPrompt,
      interpretedPrompt: idea.interpretedPrompt,
      versions: idea.promptVersions,
    });
  } catch (error) {
    console.error("Error fetching prompt history:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt history" },
      { status: 500 },
    );
  }
}

// PUT /api/ideas/[id]/prompt - Update prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;
    const { prompt, triggerResearch = false } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Verify idea exists and belongs to user
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
      include: {
        promptVersions: {
          orderBy: { editedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Check if prompt actually changed
    const lastVersion = idea.promptVersions[0];
    if (lastVersion && lastVersion.prompt === prompt) {
      return NextResponse.json(
        { error: "New prompt must be different from previous version" },
        { status: 400 },
      );
    }

    // Extract URLs from new prompt
    const extractedUrls = extractUrlsFromSources({ text: prompt });
    const urlStrings = sanitizeUrlStrings(extractedUrls);

    // Detect location mentions in new prompt
    const locationMentions = detectLocationFromText(prompt);

    // Start a transaction to update prompt and create version
    const [updatedIdea, newVersion] = await db.$transaction(async (tx) => {
      // Create new prompt version
      const version = await tx.promptVersion.create({
        data: {
          ideaId,
          prompt,
          triggeredResearch: triggerResearch,
          editedBy: session.user.id,
        },
      });

      // Update idea with new prompt and merge URLs
      const mergedUrls = sanitizeUrlStrings([...idea.extractedUrls, ...urlStrings]);
      console.debug("[prompt.update] extractedUrls merge", {
        ideaId,
        incomingCount: urlStrings.length,
        existingCount: idea.extractedUrls.length,
        mergedCount: mergedUrls.length,
        sampleType: typeof mergedUrls[0],
      });
      const updated = await tx.idea.update({
        where: { id: ideaId },
        data: {
          originalPrompt: prompt,
          extractedUrls: {
            set: mergedUrls,
          },
          // Update location if detected in new prompt
          ...(locationMentions.length > 0 && {
            targetLocation: locationMentions[0].name,
            locationContext: locationMentions[0].context as any,
          }),
          // Reset status if triggering research
          ...(triggerResearch && {
            status: "PENDING",
            interpretedPrompt: null,
          }),
        },
      });

      return [updated, version];
    });

    // If triggerResearch is true, delete old research and start new pipeline
    if (triggerResearch) {
      // Delete old research data
      await db.$transaction([
        db.researchPacket.deleteMany({ where: { ideaId } }),
        db.ideaScore.deleteMany({ where: { ideaId } }),
        db.researchLog.deleteMany({ where: { ideaId } }),
        db.ideaSnapshot.deleteMany({ where: { ideaId } }),
        db.researchJob.deleteMany({ where: { ideaId } }),
      ]);

      // Trigger new research
      await inngest.send({
        name: "idea.submitted",
        data: {
          ideaId,
          userId: session.user.id,
          isReResearch: true,
        },
      });

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "idea.prompt_edited_and_researched",
          resource: "idea",
          resourceId: ideaId,
          metadata: {
            versionId: newVersion.id,
            triggerResearch: true,
          },
        },
      });
    } else {
      // Just log the edit
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "idea.prompt_edited",
          resource: "idea",
          resourceId: ideaId,
          metadata: {
            versionId: newVersion.id,
            triggerResearch: false,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
      version: newVersion,
      researchTriggered: triggerResearch,
      extractedUrls: urlStrings,
      detectedLocations: locationMentions.map((l) => l.name),
    });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Failed to update prompt" },
      { status: 500 },
    );
  }
}

// DELETE /api/ideas/[id]/prompt/versions/[versionId] - Delete a version
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: ideaId } = await params;
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get("versionId");

    if (!versionId) {
      return NextResponse.json(
        { error: "Version ID is required" },
        { status: 400 },
      );
    }

    // Verify idea exists and belongs to user
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Delete the version
    await db.promptVersion.delete({
      where: {
        id: versionId,
        ideaId, // Ensure it belongs to this idea
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt version:", error);
    return NextResponse.json(
      { error: "Failed to delete prompt version" },
      { status: 500 },
    );
  }
}
