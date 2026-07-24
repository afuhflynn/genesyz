import type { Metadata } from "next";
import { TasksPageContent } from "./TasksPageContent";

interface TasksPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TasksPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Tasks | ${slug}`,
    description: "Manage startup task lists and execution workflow",
  };
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { slug } = await params;

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <TasksPageContent slug={slug} />
    </div>
  );
}
