import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StartupSchool } from "@/components/school/startup-school";
import { Button } from "@/components/ui/button";

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Startup School | Genesyz",
  description: "Learn how to build a successful startup",
};

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { slug } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/startups/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Startup School
        </h1>
      </div>

      <StartupSchool slug={slug} />
    </div>
  );
}
