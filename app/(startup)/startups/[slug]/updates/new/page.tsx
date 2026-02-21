import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

  const startup = await db.startup.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      userId: session.user.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      currentWeekNumber: true,
      isLaunched: true,
      primaryMetricType: true,
    },
  });

  if (!startup) {
    notFound();
  }

  const existingUpdate = await db.weeklyUpdate.findUnique({
    where: {
      startupId_weekNumber: {
        startupId: startup.id,
        weekNumber: startup.currentWeekNumber,
      },
    },
  });

  if (existingUpdate) {
    redirect(`/startups/${slug}/updates`);
  }

  const previousUpdate = await db.weeklyUpdate.findFirst({
    where: {
      startupId: startup.id,
      weekNumber: { lt: startup.currentWeekNumber },
    },
    orderBy: { weekNumber: "desc" },
    select: {
      goals: {
        select: { content: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  const previousGoals = previousUpdate?.goals.map((g) => g.content) || [];

  return (
    <NewWeeklyUpdate
      startupId={startup.id}
      startupSlug={startup.slug}
      startupName={startup.name}
      currentWeekNumber={startup.currentWeekNumber}
      isLaunched={startup.isLaunched}
      currentPrimaryMetric={startup.primaryMetricType}
      previousGoals={previousGoals}
    />
  );
}
