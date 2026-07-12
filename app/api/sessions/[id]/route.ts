import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const target = await db.session.findUnique({
    where: { id },
    select: { token: true, userId: true },
  });

  if (!target) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (target.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await auth.api.revokeSession({
    headers: await headers(),
    body: { token: target.token },
  });

  return NextResponse.json({ success: true });
}
