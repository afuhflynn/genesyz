export function getStatusVariant(status: string) {
  switch (status) {
    case "RESEARCHED":
      return "default";
    case "PROCESSING":
      return "secondary";
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}

export function getVerdictBorderColor(verdict: string) {
  switch (verdict) {
    case "pursue-immediately":
      return "border-l-green-500";
    case "pursue-with-modifications":
      return "border-l-blue-500";
    case "needs-more-research":
      return "border-l-amber-500";
    case "pivot-needed":
      return "border-l-orange-500";
    case "not-recommended":
      return "border-l-red-500";
    default:
      return "border-l-border";
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case "medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    default:
      return "";
  }
}
