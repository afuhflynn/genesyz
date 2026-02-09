"use client";

import { Globe, Info, MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarketSizeData {
  value: string;
  methodology: string;
  confidence?: "high" | "medium" | "low";
}

interface LocationMarketSize {
  location: string;
  tam: MarketSizeData;
  sam: MarketSizeData;
  som: MarketSizeData;
  growthRate: {
    value: string;
    methodology: string;
    period?: string;
  };
  confidence: "high" | "medium" | "low";
  dataSource?: string;
}

interface MarketSizeDisplayProps {
  marketSize: {
    global: LocationMarketSize;
    regional?: LocationMarketSize;
    local?: LocationMarketSize;
    year?: number;
    currency?: string;
    methodology?: string;
  };
}

const confidenceColors = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-red-100 text-red-800 border-red-200",
};

function MarketSizeBar({
  label,
  value,
  color,
  width,
}: {
  label: string;
  value: string;
  color: string;
  width: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function LocationSection({
  data,
  icon: Icon,
  title,
}: {
  data: LocationMarketSize;
  icon: React.ElementType;
  title: string;
}) {
  // Calculate relative widths for visualization
  const maxValue = parseMarketValue(data.tam.value) || 1;
  const tamWidth = "100%";
  const samWidth = `${(parseMarketValue(data.sam.value) / maxValue) * 100}%`;
  const somWidth = `${(parseMarketValue(data.som.value) / maxValue) * 100}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold">{title}</h4>
          <span className="text-sm text-muted-foreground">
            ({data.location})
          </span>
        </div>
        <Badge variant="outline" className={confidenceColors[data.confidence]}>
          {data.confidence} confidence
        </Badge>
      </div>

      <div className="space-y-3">
        <MarketSizeBar
          label="TAM (Total Addressable Market)"
          value={data.tam.value}
          color="bg-blue-500"
          width={tamWidth}
        />
        <MarketSizeBar
          label="SAM (Serviceable Addressable Market)"
          value={data.sam.value}
          color="bg-blue-400"
          width={samWidth}
        />
        <MarketSizeBar
          label="SOM (Serviceable Obtainable Market)"
          value={data.som.value}
          color="bg-blue-300"
          width={somWidth}
        />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          <span>Growth: {data.growthRate.value}</span>
          {data.growthRate.period && (
            <span className="text-xs">({data.growthRate.period})</span>
          )}
        </div>
        {data.dataSource && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 hover:text-foreground">
                <Info className="h-4 w-4" />
                <span>Source</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{data.dataSource}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

// Helper to parse market size values for visualization
function parseMarketValue(value: string): number {
  // Extract numeric value from strings like "$100B", "50M", etc.
  const match = value.match(/[\d.]+/);
  if (!match) return 0;

  let num = parseFloat(match[0]);

  // Handle suffixes
  if (value.includes("T")) num *= 1000;
  if (value.includes("B")) num *= 1;
  if (value.includes("M")) num *= 0.001;

  return num;
}

export function MarketSizeDisplay({ marketSize }: MarketSizeDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Market Size Analysis
          {marketSize.year && (
            <span className="text-sm font-normal text-muted-foreground">
              ({marketSize.year})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Market */}
        <LocationSection
          data={marketSize.global}
          icon={Globe}
          title="Global Market"
        />

        {/* Regional Market (if available) */}
        {marketSize.regional && (
          <>
            <div className="border-t" />
            <LocationSection
              data={marketSize.regional}
              icon={MapPin}
              title="Regional Market"
            />
          </>
        )}

        {/* Methodology note */}
        {marketSize.methodology && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Methodology:</strong> {marketSize.methodology}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
