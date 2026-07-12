import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { getWeeksSinceCreation } from "@/lib/utils/date";
import { NewWeeklyUpdate } from "./NewWeeklyUpdate";

interface NewUpdatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: NewUpdatePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `New Weekly Update | ${slug}`,
    description: "Submit your weekly startup update",
  };
}

export default async function NewUpdatePage({ params }: NewUpdatePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { slug } = await params;

  const access = await checkStartupAccess(slug, "submit_weekly_update");

  if (!access.hasAccess || !access.startupId) {
    notFound();
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      isLaunched: true,
      primaryMetricType: true,
      _count: {
        select: { weeklyUpdates: true },
      },
    },
  });

  if (!startup) {
    notFound();
  }

  const weekNumber = getWeeksSinceCreation(startup.createdAt);
  const submissionCount = startup._count.weeklyUpdates;

  const existingUpdate = await db.weeklyUpdate.findUnique({
    where: {
      startupId_weekNumber: {
        startupId: startup.id,
        weekNumber,
      },
    },
  });

  if (existingUpdate) {
    redirect(`/startups/${slug}/updates`);
  }

  const previousUpdate = await db.weeklyUpdate.findFirst({
    where: {
      startupId: startup.id,
    },
    orderBy: { weekNumber: "desc" },
    select: {
      goals: {
        select: { content: true, completed: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  const previousGoals =
    previousUpdate?.goals.map((g) => ({
      content: g.content,
      completed: g.completed,
    })) || [];

  return (
    <NewWeeklyUpdate
      startupId={startup.id}
      startupSlug={startup.slug}
      startupName={startup.name}
      weekNumber={weekNumber}
      submissionCount={submissionCount}
      isLaunched={startup.isLaunched}
      currentPrimaryMetric={startup.primaryMetricType}
      previousGoals={previousGoals}
    />
  );
}
