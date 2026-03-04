import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkStartupAccess } from "@/lib/startup-permissions";
import { StartupSettings } from "./StartupSettings";

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SettingsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Settings | ${slug}`,
    description: "Manage your startup settings",
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { slug } = await params;

  const access = await checkStartupAccess(slug, "view_settings");

  if (!access.hasAccess) {
    notFound();
  }

  return <StartupSettings slug={slug} currentUserId={session.user.id} />;
}
