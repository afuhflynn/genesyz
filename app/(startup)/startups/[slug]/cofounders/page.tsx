import { ArrowLeft, HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CofoundersPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Co-Founder Match | Genesyz",
  description: "Find your perfect co-founder",
};

export default async function CofoundersPage({ params }: CofoundersPageProps) {
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
          Co-Founder Match
        </h1>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-purple-100 p-4">
            <HeartHandshake className="h-12 w-12 text-purple-600" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 max-w-md text-center text-muted-foreground">
            We're building a co-founder matching system to help you find the
            perfect partner for your startup. Get matched based on skills,
            experience, and startup goals.
          </p>

          <div className="mt-8 rounded-lg bg-muted/50 p-6">
            <h3 className="font-medium">What to expect:</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                • Create a co-founder profile with your skills and interests
              </li>
              <li>• Browse other founders looking for partners</li>
              <li>• Get AI-powered match suggestions</li>
              <li>• Connect and chat with potential co-founders</li>
            </ul>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Want to be notified when Co-Founder Match launches?{" "}
            <Link href="/settings" className="text-primary underline">
              Enable email notifications
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
