import type { Metadata } from "next";
import { AcceleratorsList } from "@/components/accelerators/accelerators-list";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accelerators | Genesyz",
  description: "Browse and join accelerator programs to grow your startup",
};

export default async function AcceleratorsPage() {
  const accelerators = await db.accelerator.findMany({
    where: { isPublic: true, isActive: true },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { cohorts: true, applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AcceleratorsList accelerators={accelerators} />;
}
