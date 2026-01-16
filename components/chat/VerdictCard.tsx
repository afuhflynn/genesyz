"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  ArrowRight,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VerdictData {
  ideaId: string;
  ideaTitle: string;
  verdict: "Go" | "Pause" | "Kill";
  onePriority: string;
  oneStop: string;
  topRisk: {
    category: "Market" | "Product" | "Financial" | "Team";
    description: string;
  };
  evidence: string[];
  counterArgument: string;
  deltas?: {
    verdictChanged: boolean;
    metricDeltas?: Record<string, number>;
  };
}

export function VerdictCard({ data }: { data: VerdictData }) {
  const verdictColors = {
    Go: "bg-green-100 text-green-800 border-green-200",
    Pause: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Kill: "bg-red-100 text-red-800 border-red-200",
  };

  const riskColors = {
    Market: "bg-blue-100 text-blue-800 border-blue-200",
    Product: "bg-purple-100 text-purple-800 border-purple-200",
    Financial: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Team: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const verdictIcons = {
    Go: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    Pause: <PauseCircle className="w-5 h-5 text-yellow-600" />,
    Kill: <StopCircle className="w-5 h-5 text-red-600" />,
  };

  return (
    <Card className="w-full max-w-2xl border-2 shadow-lg overflow-hidden">
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2",
          verdictColors[data.verdict]
        )}
      >
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          {verdictIcons[data.verdict]}
          {data.ideaTitle}: {data.verdict}
        </CardTitle>
        {data.deltas?.verdictChanged && (
          <Badge variant="destructive" className="animate-pulse">
            VERDICT CHANGE
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              One Priority
            </h4>
            <p className="text-lg font-medium text-gray-900">
              {data.onePriority}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              One Stop
            </h4>
            <p className="text-lg font-medium text-red-600">{data.oneStop}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Top Risk
            </h4>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase",
                riskColors[data.topRisk.category]
              )}
            >
              {data.topRisk.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-900 font-medium mb-2">
            {data.topRisk.description}
          </p>
          <p className="text-sm text-gray-600 italic">
            "Counter-argument: {data.counterArgument}"
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Evidence & Signals
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {data.evidence.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {data.deltas?.metricDeltas &&
          Object.keys(data.deltas.metricDeltas).length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Weekly Deltas
              </h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(data.deltas.metricDeltas).map(
                  ([metric, delta]) => (
                    <div key={metric} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{metric}:</span>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          delta > 0
                            ? "text-green-600"
                            : delta < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        )}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}%
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
