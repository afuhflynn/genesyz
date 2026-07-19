import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { VCCoach } from "@/components/startups";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkStartupAccess } from "@/lib/startup-permissions";

interface VCCoachNewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VCCoachNewPage({
  params,
}: VCCoachNewPageProps) {
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
    <VCCoach startupId={startup.id} startupName={startup.name} />
  );
}
