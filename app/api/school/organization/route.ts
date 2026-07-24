import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const organizations = await db.member.findMany({ where: { userId: session.user.id }, select: { role: true, organization: { select: { id: true, name: true, slug: true } } } });
  return NextResponse.json({ data: organizations.map((membership) => ({ ...membership.organization, role: membership.role })) });
}
