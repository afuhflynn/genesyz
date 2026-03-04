import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { EditWeeklyUpdate } from "./EditWeeklyUpdate";

interface EditUpdatePageProps {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({
  params,
}: EditUpdatePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Edit Weekly Update | ${slug}`,
    description: "Edit your weekly startup update",
  };
}

export default async function EditUpdatePage({ params }: EditUpdatePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { slug, id } = await params;

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
    },
  });

  if (!startup) {
    notFound();
  }

  const update = await db.weeklyUpdate.findFirst({
    where: {
      id,
      startupId: startup.id,
    },
    include: {
      goals: {
        orderBy: { priority: "asc" },
      },
    },
  });

  if (!update) {
    notFound();
  }

  // Check if update is still editable
  const now = new Date();
  const editableUntil = update.editableUntil
    ? new Date(update.editableUntil)
    : null;

  if (update.isLocked || (editableUntil && editableUntil <= now)) {
    // Redirect back to updates list with a message
    redirect(`/startups/${slug}/updates?error=locked`);
  }

  // Get previous update's goals for review
  const previousUpdate = await db.weeklyUpdate.findFirst({
    where: {
      startupId: startup.id,
      weekNumber: { lt: update.weekNumber },
    },
    orderBy: { weekNumber: "desc" },
    select: {
      goals: {
        select: { content: true, completed: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  return (
    <EditWeeklyUpdate
      startupId={startup.id}
      startupSlug={startup.slug}
      startupName={startup.name}
      update={{
        ...update,
        userLearnings: update.userLearnings || "",
        topImprovements: update.topImprovements || "",
        biggestObstacle: update.biggestObstacle || "",
      }}
      previousGoals={previousUpdate?.goals || []}
    />
  );
}
