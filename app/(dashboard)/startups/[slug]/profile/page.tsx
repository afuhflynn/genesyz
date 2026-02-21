import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { StartupProfileForm } from "@/components/startups";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Edit Profile | ${slug}`,
    description: "Edit your startup profile",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { slug } = await params;

  const startup = await db.startup.findFirst({
    where: { slug, userId: session.user.id, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      description: true,
      industry: true,
      stage: true,
      targetMarket: true,
      website: true,
      location: true,
      idea: {
        select: {
          id: true,
          title: true,
          summary: true,
        },
      },
    },
  });

  if (!startup) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <StartupProfileForm
        ideaId={startup.idea.id}
        ideaTitle={startup.idea.title || undefined}
        ideaSummary={startup.idea.summary || undefined}
        existingStartup={{
          id: startup.id,
          name: startup.name,
          slug: startup.slug,
          tagline: startup.tagline,
          description: startup.description,
          industry: startup.industry,
          stage: startup.stage,
          targetMarket: startup.targetMarket,
          website: startup.website,
          location: startup.location,
        }}
      />
    </div>
  );
}
