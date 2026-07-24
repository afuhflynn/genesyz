import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function admin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN" ? session.user : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await admin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const certificate = await db.certificate.update({ where: { id: (await params).id }, data: { status: body.status === "ACTIVE" ? "ACTIVE" : "REVOKED", revokedAt: body.status === "ACTIVE" ? null : new Date(), revocationReason: body.status === "ACTIVE" ? null : body.reason || "Revoked by administrator" } });
  return NextResponse.json({ data: certificate });
}
