import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StartupDashboard } from "./StartupDashboard";

interface StartupPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: StartupPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | IdeasVault`,
    description: "Startup dashboard and weekly progress tracking",
  };
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { slug } = await params;

  return <StartupDashboard slug={slug} />;
}
