import type { Metadata } from "next";
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
  const { slug } = await params;
  return <StartupSettings slug={slug} />;
}
