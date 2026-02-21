import { ArrowLeft, ExternalLink, School } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SchoolPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Startup School | IdeasVault",
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

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-blue-100 p-4">
            <School className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            We're building a curated learning experience with courses, guides,
            and resources to help you succeed. In the meantime, check out these
            recommended resources.
          </p>

          <div className="mt-8 space-y-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <a
                href="https://www.startupschool.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>YC Startup School</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <a
                href="https://www.ycombinator.com/library"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>YC Startup Library</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <a
                href="https://www.paulgraham.com/articles.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Paul Graham Essays</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Want to be notified when Startup School launches?{" "}
            <Link href="/settings" className="text-primary underline">
              Enable email notifications
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
