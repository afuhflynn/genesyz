"use client";

import { format } from "date-fns";
import {
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  Rocket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programType: string;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  durationWeeks: number | null;
  benefits: string | null;
  requirements: string | null;
  maxStartups: number | null;
  fundingAmount: string | null;
  owner: { id: string; name: string | null; image: string | null };
  cohorts: Array<{
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    _count: { startups: number };
  }>;
  _count: { applications: number; cohorts: number };
}

export function AcceleratorPublicView({
  accelerator,
}: {
  accelerator: Accelerator;
}) {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          {accelerator.logoUrl ? (
            <img
              src={accelerator.logoUrl}
              alt={accelerator.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{accelerator.name}</h1>
            <p className="text-muted-foreground capitalize">
              {accelerator.programType}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {accelerator.website && (
            <Button variant="outline" asChild>
              <a
                href={accelerator.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href={`/accelerators/${accelerator.slug}/apply`}>
              Apply Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Clock className="mr-2 inline h-4 w-4" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accelerator.durationWeeks
                ? `${accelerator.durationWeeks} weeks`
                : "Varies"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Users className="mr-2 inline h-4 w-4" />
              Cohort Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accelerator.maxStartups || "Up to 20"} startups
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Rocket className="mr-2 inline h-4 w-4" />
              Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accelerator.fundingAmount || "Not specified"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Calendar className="mr-2 inline h-4 w-4" />
              Cohorts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accelerator._count.cohorts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {accelerator.description && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{accelerator.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {accelerator.benefits && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{accelerator.benefits}</p>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {accelerator.requirements && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{accelerator.requirements}</p>
          </CardContent>
        </Card>
      )}

      {/* Cohorts */}
      {accelerator.cohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Cohorts</CardTitle>
            <CardDescription>
              Past accelerator cohorts and their timelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accelerator.cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{cohort.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(cohort.startDate), "MMM yyyy")} -{" "}
                      {format(new Date(cohort.endDate), "MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {cohort._count.startups} startups
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
