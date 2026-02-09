import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "@/lib/inngest/client";
import { detectBestLocation, validateLocation } from "@/lib/location";
import { extractUrlsFromSources } from "@/lib/scraping";

interface OnboardingData {
  founderName: string;
  founderRole: string;
  experienceLevel: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  targetLocation: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    isGlobal?: boolean;
  } | null;
  traction: string;
  teamSize: string;
  timeline: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: OnboardingData = await request.json();

    // Validate required fields
    if (!data.problem || !data.solution || !data.targetCustomer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Build prompt from onboarding data
    const prompt = `I'm ${data.founderName}, a ${data.founderRole} (${data.experienceLevel} founder).

Problem: ${data.targetCustomer} face this problem: ${data.problem}

Solution: I'm building ${data.solution} to solve this.

Target: ${data.targetCustomer} in ${data.targetLocation?.country || "global market"}.

Current traction: ${data.traction}. Team size: ${data.teamSize}. Timeline: ${data.timeline}.`;

    // Detect or validate location
    let locationContext = null;
    if (data.targetLocation) {
      const validation = await validateLocation(
        data.targetLocation.country || "global",
      );
      if (validation.isValid) {
        locationContext = validation.context;
      }
    }

    // Create the idea
    const idea = await db.idea.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        originalPrompt: prompt,
        targetLocation: data.targetLocation?.country || null,
        locationContext: locationContext as any,
      },
    });

    // Create the text input record
    const input = await db.ideaInput.create({
      data: {
        ideaId: idea.id,
        type: "TEXT",
        content: prompt,
        extractedUrls: [],
      },
    });

    // Trigger research
    await inngest.send({
      name: "idea.submitted",
      data: {
        ideaId: idea.id,
        userId: session.user.id,
        isReResearch: false,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "idea.created_from_onboarding",
        resource: "idea",
        resourceId: idea.id,
        metadata: {
          experienceLevel: data.experienceLevel,
          targetLocation: data.targetLocation,
          traction: data.traction,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        ideaId: idea.id,
        message: "Idea created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 },
    );
  }
}
