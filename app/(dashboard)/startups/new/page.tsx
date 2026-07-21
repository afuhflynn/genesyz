import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { StartupProfileForm } from "@/components/startups";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface NewStartupPageProps {
  searchParams: Promise<{
    ideaId?: string;
    name?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Create Startup | Genesyz",
  description: "Turn your validated idea into an active startup",
};

export default async function NewStartupPage({
  searchParams,
}: NewStartupPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const ideaId = params.ideaId;

  let idea: {
    id: string;
    title: string | null;
    summary: string | null;
    targetLocation: string | null;
    locationContext: unknown;
    researchPackets: { content: unknown }[];
  } | null = null;

  if (ideaId) {
    idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        targetLocation: true,
        locationContext: true,
        researchPackets: {
          where: { agentType: "MARKET_RESEARCH" },
          select: { content: true },
          take: 1,
        },
      },
    });

    if (!idea) {
      notFound();
    }

    const existingStartup = await db.startup.findUnique({
      where: { ideaId },
      select: { id: true, slug: true },
    });

    if (existingStartup) {
      redirect(`/startups/${existingStartup.slug}`);
    }
  }

  const initialLocation = idea?.targetLocation || undefined;
  const initialLocationContext = idea?.locationContext as
    | Record<string, unknown>
    | null
    | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <span className="text-2xl">{idea ? "🚀" : "✨"}</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Startup Profile
          </h1>
          <p className="text-muted-foreground">
            {idea
              ? `You've validated "${idea.title || "your idea"}" — now make it official`
              : "Set up a new startup to start tracking your progress"}
          </p>
        </div>
      </div>

      <StartupProfileForm
        ideaId={idea?.id}
        ideaTitle={idea?.title || undefined}
        ideaSummary={idea?.summary || undefined}
        initialLocation={initialLocation}
        initialLocationContext={
          initialLocationContext as Record<string, unknown> | null | undefined
        }
      />
    </div>
  );
}
