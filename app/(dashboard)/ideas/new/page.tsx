"use client";

import { EnhancedNewIdeaForm } from "@/components/ideas/EnhancedNewIdeaForm";

export default function NewIdeaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capture New Idea</h1>
        <p className="text-muted-foreground mt-2">
          Describe your startup idea in text. Our AI agents will analyze it
          immediately with market insights.
        </p>
      </div>
      <EnhancedNewIdeaForm enabledModes={["text"]} />
    </div>
  );
}
