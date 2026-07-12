import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const excludeAcceleratorId = searchParams.get("excludeAcceleratorId");

  // Basic authorization: user must be an ADMIN or own/be a member of an accelerator to search globally
  // for the purpose of onboarding startups.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isGlobalAdmin = user?.role === "ADMIN";
  const acceleratorMember = await db.acceleratorMember.findFirst({
    where: { userId: session.user.id }
  });
  const acceleratorOwner = await db.accelerator.findFirst({
    where: { ownerId: session.user.id }
  });

  if (!isGlobalAdmin && !acceleratorMember && !acceleratorOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startups = await db.startup.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { user: { email: { contains: query, mode: "insensitive" } } },
        { industry: { contains: query, mode: "insensitive" } },
      ],
      ...(excludeAcceleratorId && {
        NOT: {
          cohortStartups: {
            some: {
              cohort: {
                acceleratorId: excludeAcceleratorId,
              },
            },
          },
        },
      }),
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    take: 10,
  });

  return NextResponse.json({ data: startups });
}
