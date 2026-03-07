import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AcceleratorAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Find the IdeasVault Accelerator
  const accelerator = await db.accelerator.findUnique({
    where: { slug: "ideasvault-accelerator" },
    select: { id: true, slug: true },
  });

  if (!accelerator) {
    redirect("/my-accelerators");
  }

  // Check if user is a member
  const membership = await db.acceleratorMember.findUnique({
    where: {
      acceleratorId_userId: {
        acceleratorId: accelerator.id,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    redirect("/my-accelerators");
  }

  // Redirect to the accelerator admin page
  redirect(`/admin/accelerators/${accelerator.slug}`);
}
