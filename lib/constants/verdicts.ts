import { TrendingDown, TrendingUp, Zap } from "lucide-react";

export const VERDICT_CONFIG: Record<
  string,
  { color: string; icon: typeof TrendingUp; label: string }
> = {
  ON_TRACK: {
    color: "text-green-600 bg-green-50 border-green-200",
    icon: TrendingUp,
    label: "On Track",
  },
  NEEDS_ATTENTION: {
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: Zap,
    label: "Needs Attention",
  },
  AT_RISK: {
    color: "text-red-600 bg-red-50 border-red-200",
    icon: TrendingDown,
    label: "At Risk",
  },
};
