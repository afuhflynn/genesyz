"use client";

import { format } from "date-fns";
import { Eye, Plus, Rocket, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAcceleratorApplications, useAccelerators } from "@/hooks";

export default function MyAcceleratorsPage() {
  const { data: acceleratorsData, isLoading } = useAccelerators();
  const accelerators = acceleratorsData?.data || [];

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Accelerators</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your accelerator programs and applications
          </p>
        </div>
        <Button asChild>
          <Link href="/accelerators/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Accelerator
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : accelerators.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Rocket className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No accelerators yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first accelerator program to start accepting
              applications.
            </p>
            <Button asChild className="mt-4">
              <Link href="/accelerators/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Accelerator
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Accelerators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{accelerators.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {accelerators.filter((a) => a.isActive).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {accelerators.reduce(
                    (sum, a) => sum + a._count.applications,
                    0,
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="accelerators">
            <TabsList>
              <TabsTrigger value="accelerators">My Accelerators</TabsTrigger>
              <TabsTrigger value="applications">All Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="accelerators" className="space-y-4">
              {accelerators.map((accelerator) => (
                <AcceleratorCard
                  key={accelerator.id}
                  accelerator={accelerator}
                />
              ))}
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              {accelerators.map((accelerator) => (
                <ApplicationsList
                  key={accelerator.id}
                  accelerator={accelerator}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function AcceleratorCard({ accelerator }: { accelerator: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
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
              <p className="text-sm text-muted-foreground capitalize">
                {accelerator.programType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/accelerators/${accelerator.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {accelerator._count.applications} applications
          </span>
          <span>{accelerator._count.cohorts} cohorts</span>
          <span
            className={
              accelerator.isPublic ? "text-green-600" : "text-yellow-600"
            }
          >
            {accelerator.isPublic ? "Public" : "Private"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationsList({ accelerator }: { accelerator: any }) {
  const { data: applicationsData } = useAcceleratorApplications(
    accelerator.slug,
  );
  const applications = applicationsData?.data || [];

  if (applications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accelerator.name} Applications</CardTitle>
        <CardDescription>
          {applications.length} application
          {applications.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app: any) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{app.founderName}</p>
                <p className="text-sm text-muted-foreground">
                  {app.founderEmail}
                </p>
                {app.startup && (
                  <p className="text-sm text-muted-foreground">
                    Startup: {app.startup.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Applied {format(new Date(app.appliedAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    app.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
