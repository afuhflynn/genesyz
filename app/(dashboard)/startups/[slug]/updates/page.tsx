import type { Metadata } from "next";
import { WeeklyUpdatesList } from "./WeeklyUpdatesList";

interface UpdatesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: UpdatesPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Weekly Updates | ${slug}`,
    description: "View and manage your weekly startup updates",
  };
}

export default async function UpdatesPage({ params }: UpdatesPageProps) {
  const { slug } = await params;
  return <WeeklyUpdatesList slug={slug} />;
}
