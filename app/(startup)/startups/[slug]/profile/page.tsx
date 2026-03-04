import { ArrowLeft, Users } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StartupProfileForm, TeamTab } from "@/components/startups";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    where: {
      OR: [{ slug }, { id: slug }],
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      userId: true,
      tagline: true,
      description: true,
      industry: true,
      stage: true,
      targetMarket: true,
      website: true,
      location: true,
      createdAt: true,
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

  const isOwner = startup.userId === session.user.id;

  const membership = await db.startupMember.findUnique({
    where: {
      startupId_userId: {
        startupId: startup.id,
        userId: session.user.id,
      },
    },
    select: {
      role: true,
    },
  });

  const userRole = isOwner ? "OWNER" : membership?.role;
  const hasAccess = !!userRole;

  if (!hasAccess) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don&apos;t have access to this startup.
        </p>
        <Button asChild className="mt-4">
          <Link href="/startups">Go to Startups</Link>
        </Button>
      </div>
    );
  }

  const canEditProfile = isOwner || userRole === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${startup.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Profile</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
            canEdit={canEditProfile}
          />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab
            startupId={startup.id}
            startupSlug={slug}
            currentUserId={session.user.id}
            canManage={isOwner || userRole === "ADMIN"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
