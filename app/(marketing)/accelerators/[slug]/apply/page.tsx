"use client";

import { ArrowLeft, Loader2, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAccelerator, useApplyToAccelerator, useStartups } from "@/hooks";

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
}

export default function ApplyToAcceleratorPage({ params }: ApplyPageProps) {
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const router = useRouter();
  const { data: acceleratorData, isLoading: isAcceleratorLoading } =
    useAccelerator(slug);
  const { data: startupsData } = useStartups();
  const applyMutation = useApplyToAccelerator(slug);

  const [formData, setFormData] = useState({
    founderName: "",
    founderEmail: "",
    founderPhone: "",
    startupId: "",
    pitch: "",
  });

  const accelerator = acceleratorData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await applyMutation.mutateAsync({
      founderName: formData.founderName,
      founderEmail: formData.founderEmail,
      founderPhone: formData.founderPhone || undefined,
      startupId: formData.startupId || undefined,
      answers: formData.pitch ? { pitch: formData.pitch } : undefined,
    });
  };

  if (isAcceleratorLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!accelerator) {
    return (
      <div className="container mx-auto max-w-3xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <Rocket className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">
              Accelerator not found
            </h2>
            <p className="mt-2 text-muted-foreground">
              This accelerator may not exist or is no longer available.
            </p>
            <Button asChild className="mt-4">
              <Link href="/accelerators">Browse Accelerators</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startups = startupsData?.data || [];

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href={`/accelerators/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {accelerator.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Apply to {accelerator.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Submit your application to join this accelerator program
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How can the accelerator reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="founderName">Your Name *</Label>
                <Input
                  id="founderName"
                  placeholder="John Doe"
                  value={formData.founderName}
                  onChange={(e) =>
                    setFormData({ ...formData, founderName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="founderEmail">Email *</Label>
                  <Input
                    id="founderEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.founderEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, founderEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founderPhone">Phone (optional)</Label>
                  <Input
                    id="founderPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.founderPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, founderPhone: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {startups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Startup</CardTitle>
                <CardDescription>
                  Link your IdeasVault startup (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="startupId">Select Startup</Label>
                  <select
                    id="startupId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.startupId}
                    onChange={(e) =>
                      setFormData({ ...formData, startupId: e.target.value })
                    }
                  >
                    <option value="">
                      No startup - just applying as founder
                    </option>
                    {startups.map((startup: any) => (
                      <option key={startup.id} value={startup.id}>
                        {startup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Pitch</CardTitle>
              <CardDescription>
                Tell the accelerator why they should accept you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="pitch">Pitch</Label>
                <Textarea
                  id="pitch"
                  placeholder="Describe your startup, team, and why you want to join this program..."
                  value={formData.pitch}
                  onChange={(e) =>
                    setFormData({ ...formData, pitch: e.target.value })
                  }
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href={`/accelerators/${slug}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={applyMutation.isPending}>
              {applyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Application
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
