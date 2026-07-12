import { redirect } from "next/navigation";

interface ApplicationsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
  const { slug } = await params;
  redirect(`/startups/${slug}/tasks`);
}
