import type { Metadata } from "next";
import { MetricsDashboard } from "./MetricsDashboard";

interface MetricsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MetricsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Metrics | ${slug}`,
    description: "Track your startup metrics and KPIs",
  };
}

export default async function MetricsPage({ params }: MetricsPageProps) {
  const { slug } = await params;
  return <MetricsDashboard slug={slug} />;
}
