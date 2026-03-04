import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcceleratorPublicView } from "@/components/accelerators/public-view";
import { db } from "@/lib/db";

interface AcceleratorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AcceleratorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const accelerator = await db.accelerator.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!accelerator) {
    return { title: "Accelerator Not Found" };
  }

  return {
    title: `${accelerator.name} | IdeasVault`,
    description:
      accelerator.description || `Learn more about ${accelerator.name}`,
  };
}

export default async function AcceleratorPage({
  params,
}: AcceleratorPageProps) {
  const { slug } = await params;

  const accelerator = await db.accelerator.findUnique({
    where: { slug, isPublic: true, isActive: true },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      cohorts: {
        where: { isActive: true },
        orderBy: { startDate: "desc" },
        include: {
          _count: { select: { startups: true } },
        },
      },
      _count: { select: { applications: true, cohorts: true } },
    },
  });

  if (!accelerator) {
    notFound();
  }

  return <AcceleratorPublicView accelerator={accelerator} />;
}
