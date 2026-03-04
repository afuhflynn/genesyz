import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Plan, prioritize, and execute across your startup task lists
          </p>
        </div>
      </div>

      <TasksPageContent slug={slug} />
    </div>
  );
}
