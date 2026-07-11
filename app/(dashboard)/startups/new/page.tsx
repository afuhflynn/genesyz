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

  if (!ideaId) {
    redirect("/ideas");
  }

  const idea = await db.idea.findFirst({
    where: {
      id: ideaId,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      summary: true,
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

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Startup Profile
        </h1>
        <p className="text-muted-foreground">
          Turn "{idea.title || "your idea"}" into an active startup
        </p>
      </div>

      <StartupProfileForm
        ideaId={idea.id}
        ideaTitle={idea.title || undefined}
        ideaSummary={idea.summary || undefined}
      />
    </div>
  );
}
