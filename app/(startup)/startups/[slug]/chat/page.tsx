import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { VCCoach } from "@/components/startups";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

interface VCCoachPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VCCoachPage({ params }: VCCoachPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    notFound();
  }

  const { slug } = await params;

  const access = await checkStartupAccess(slug, "view_startup");

  if (!access.hasAccess || !access.startupId) {
    notFound();
  }

  const startup = await db.startup.findUnique({
    where: { id: access.startupId },
    select: { id: true, name: true },
  });

  if (!startup) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">VC Coach</h1>
        <p className="text-muted-foreground">
          Strategic AI advisor for {startup.name}.
        </p>
      </div>
      
      <div className="flex-1 h-full min-h-[600px]">
        <VCCoach 
          startupId={startup.id} 
          startupName={startup.name} 
        />
      </div>
    </div>
  );
}
