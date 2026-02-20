import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

export function ResearchingState({
  progress,
}: {
  progress: IResearchProgress[];
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative bg-background p-4 rounded-full border shadow-lg">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Analyzing your idea...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Our AI agents are currently researching market size, competitors, and
          execution risks. This usually takes about 1-2 minutes.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {progress.map((item, index) => (
          <div
            className="flex items-center gap-3 text-sm"
            key={`${index}-${item.id}`}
          >
            {item.status === "FAILED" ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : item.status === "COMPLETED" ||
              item.status === "INITIATE" ||
              item.status === "PROCESSING" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-muted" />
            )}
            <span>{item?.message || "No message"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
