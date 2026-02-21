import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const startup = await db.startup.findFirst({
    where: { ideaId: id, userId: session.user.id },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  return NextResponse.json({
    hasStartup: !!startup,
    startup: startup || null,
  });
}
