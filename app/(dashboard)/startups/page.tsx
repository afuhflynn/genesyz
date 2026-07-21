import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StartupsList } from "./StartupsList";

export const metadata: Metadata = {
  title: "Startups | Genesyz",
  description: "Manage your startup profiles",
};

export default function StartupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your Startups
          </h1>
          <p className="text-muted-foreground">
            Manage and track progress for your active startups
          </p>
        </div>
        <Button asChild>
          <Link href="/startups/new">
            <Plus className="mr-2 h-4 w-4" />
            New Startup
          </Link>
        </Button>
      </div>
      <StartupsList />
    </div>
  );
}
