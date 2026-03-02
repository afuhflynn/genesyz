import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplicationsPageClient } from "./ApplicationsPageClient";

interface ApplicationsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ApplicationsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Applications | ${slug}`,
    description: "Track your grant and funding applications",
  };
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Applications
          </h1>
          <p className="text-muted-foreground">
            Track your grant and funding applications
          </p>
        </div>
      </div>

      <ApplicationsPageClient slug={slug} />
    </div>
  );
}
