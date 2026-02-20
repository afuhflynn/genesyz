import { XCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function IdeaNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold">Idea not found</h2>
      <p className="text-muted-foreground mb-6">
        The idea you're looking for doesn't exist or you don't have permission
        to view it.
      </p>
      <Button asChild>
        <Link href="/ideas">Back to Ideas</Link>
      </Button>
    </div>
  );
}
