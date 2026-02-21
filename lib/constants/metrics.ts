export type MetricFormat = "CURRENCY" | "PERCENTAGE" | "NUMBER";
export type MetricPeriod =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export interface MetricConfig {
  value: string;
  label: string;
  format: MetricFormat;
  defaultPeriod?: MetricPeriod;
}

export interface MetricCategory {
  name: string;
  metrics: MetricConfig[];
}

export const METRIC_CATEGORIES: MetricCategory[] = [
  {
    name: "Revenue & Financial",
    metrics: [
      {
        value: "MRR",
        label: "Monthly Recurring Revenue (MRR)",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "ARR",
        label: "Annual Recurring Revenue (ARR)",
        format: "CURRENCY",
        defaultPeriod: "YEARLY",
      },
      {
        value: "GROSS_REVENUE",
        label: "Gross Revenue",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "NET_REVENUE",
        label: "Net Revenue",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "TAKE_RATE",
        label: "Take Rate / Fee %",
        format: "PERCENTAGE",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "SOFTWARE_SALES",
        label: "Software Sales",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "HARDWARE_SALES",
        label: "Hardware Sales",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "PREORDER_SALES",
        label: "Preorder Sales",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "LETTERS_OF_INTENT",
        label: "Letters of Intent",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "PAID_TRIALS",
        label: "Paid Trials",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "PAID_CONTRACTS",
        label: "Paid Contracts",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "ECOMMERCE_SALES",
        label: "Ecommerce Sales",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "MARKETPLACE_VOLUME",
        label: "Marketplace Volume",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "TRANSACTION_VOLUME",
        label: "Transaction Volume",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "ASSETS_UNDER_MANAGEMENT",
        label: "Assets Under Management",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
    ],
  },
  {
    name: "User & Engagement",
    metrics: [
      {
        value: "DAU",
        label: "Daily Active Users (DAU)",
        format: "NUMBER",
        defaultPeriod: "DAILY",
      },
      {
        value: "WAU",
        label: "Weekly Active Users (WAU)",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "MAU",
        label: "Monthly Active Users (MAU)",
        format: "NUMBER",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "PAYING_CUSTOMERS",
        label: "Paying Customers",
        format: "NUMBER",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "NEW_SIGNUPS",
        label: "New Signups",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "RETENTION_RATE",
        label: "Retention Rate",
        format: "PERCENTAGE",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "CHURN_RATE",
        label: "Churn Rate",
        format: "PERCENTAGE",
        defaultPeriod: "MONTHLY",
      },
    ],
  },
  {
    name: "Marketplace & Transactions",
    metrics: [
      {
        value: "GMV",
        label: "Gross Merchandise Volume (GMV)",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "COMPLETED_ORDERS",
        label: "Completed Orders",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "BOOKINGS",
        label: "Bookings",
        format: "CURRENCY",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "UNITS_SOLD",
        label: "Units Sold",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
    ],
  },
  {
    name: "Growth & Trajectory",
    metrics: [
      {
        value: "WEEK_OVER_WEEK_GROWTH",
        label: "Week-over-Week Growth",
        format: "PERCENTAGE",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "MONTH_OVER_MONTH_GROWTH",
        label: "Month-over-Month Growth",
        format: "PERCENTAGE",
        defaultPeriod: "MONTHLY",
      },
    ],
  },
  {
    name: "Special Cases",
    metrics: [
      {
        value: "SIGNED_CONTRACTS",
        label: "Signed Contracts",
        format: "NUMBER",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "PIPELINE_VALUE",
        label: "Pipeline Value",
        format: "CURRENCY",
        defaultPeriod: "MONTHLY",
      },
      {
        value: "PRODUCT_MILESTONES",
        label: "Product Milestones",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "USER_CONVERSATIONS",
        label: "User Conversations",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
      {
        value: "WAITLIST_SIGNUPS",
        label: "Waitlist Signups",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
    ],
  },
  {
    name: "Custom",
    metrics: [
      {
        value: "CUSTOM",
        label: "Custom Metric...",
        format: "NUMBER",
        defaultPeriod: "WEEKLY",
      },
    ],
  },
];

export const METRIC_PERIODS: { value: MetricPeriod; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
];

export const ALL_METRICS: MetricConfig[] = METRIC_CATEGORIES.flatMap(
  (cat) => cat.metrics,
);

export function getMetricConfig(metricType: string): MetricConfig | undefined {
  return ALL_METRICS.find((m) => m.value === metricType);
}

export function getMetricFormat(metricType: string): MetricFormat {
  const config = getMetricConfig(metricType);
  return config?.format ?? "NUMBER";
}

export function getDefaultPeriod(metricType: string): MetricPeriod {
  const config = getMetricConfig(metricType);
  return config?.defaultPeriod ?? "WEEKLY";
}

export function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case "CURRENCY":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case "PERCENTAGE":
      return `${value.toFixed(1)}%`;
    case "NUMBER":
    default:
      return new Intl.NumberFormat("en-US").format(value);
  }
}

export function parseMetricInput(input: string, format: MetricFormat): number {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

export const LAUNCHED_ONLY_METRICS = [
  "MRR",
  "ARR",
  "GROSS_REVENUE",
  "NET_REVENUE",
  "TAKE_RATE",
  "SOFTWARE_SALES",
  "HARDWARE_SALES",
  "PREORDER_SALES",
  "LETTERS_OF_INTENT",
  "PAID_TRIALS",
  "PAID_CONTRACTS",
  "ECOMMERCE_SALES",
  "MARKETPLACE_VOLUME",
  "TRANSACTION_VOLUME",
  "ASSETS_UNDER_MANAGEMENT",
  "DAU",
  "WAU",
  "MAU",
  "PAYING_CUSTOMERS",
  "NEW_SIGNUPS",
  "RETENTION_RATE",
  "CHURN_RATE",
  "GMV",
  "COMPLETED_ORDERS",
  "BOOKINGS",
  "UNITS_SOLD",
  "WEEK_OVER_WEEK_GROWTH",
  "MONTH_OVER_MONTH_GROWTH",
  "SIGNED_CONTRACTS",
  "PIPELINE_VALUE",
  "PRODUCT_MILESTONES",
  "CUSTOM",
];

export const PRELAUNCH_METRICS = ["USER_CONVERSATIONS", "WAITLIST_SIGNUPS"];
