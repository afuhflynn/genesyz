import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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
  return <StartupSettings slug={slug} currentUserId={session.user.id} />;
}
