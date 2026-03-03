"use client";

import { Rocket, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Accelerator {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programType: string;
  logoUrl: string | null;
  durationWeeks: number | null;
  maxStartups: number | null;
  fundingAmount: string | null;
  owner: { id: string; name: string | null; image: string | null };
  _count: { cohorts: number; applications: number };
}

export function AcceleratorsList({
  accelerators,
}: {
  accelerators: Accelerator[];
}) {
  const [search, setSearch] = useState("");

  const filteredAccelerators = accelerators.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Accelerators</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the perfect accelerator program to grow your startup
        </p>
      </div>

      <div className="mb-8 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accelerators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link href="/accelerators/new">Create Accelerator</Link>
        </Button>
      </div>

      {filteredAccelerators.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Rocket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">
              No accelerators found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or create a new accelerator program.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccelerators.map((accelerator) => (
            <Card key={accelerator.id} className="flex flex-col">
              <CardContent className="flex-1 p-6">
                <div className="mb-4 flex items-center gap-3">
                  {accelerator.logoUrl ? (
                    <img
                      src={accelerator.logoUrl}
                      alt={accelerator.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{accelerator.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {accelerator.programType}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {accelerator.description || "No description provided"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  {accelerator.durationWeeks && (
                    <span>{accelerator.durationWeeks} weeks</span>
                  )}
                  {accelerator.maxStartups && (
                    <span>Up to {accelerator.maxStartups} startups</span>
                  )}
                  <span>{accelerator._count.cohorts} cohorts</span>
                </div>
              </CardContent>
              <div className="border-t p-4">
                <Button asChild className="w-full">
                  <Link href={`/accelerators/${accelerator.slug}`}>
                    View Program
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
