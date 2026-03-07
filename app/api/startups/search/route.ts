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
