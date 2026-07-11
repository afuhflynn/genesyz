import type { Metadata } from "next";
import { StartupsList } from "./StartupsList";

export const metadata: Metadata = {
  title: "Startups | Genesyz",
  description: "Manage your startup profiles",
};

export default function StartupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your Startups</h1>
        <p className="text-muted-foreground">
          Manage and track progress for your active startups
        </p>
      </div>
      <StartupsList />
    </div>
  );
}
