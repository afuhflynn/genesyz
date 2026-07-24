import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const certificate = await db.certificate.findUnique({
    where: { verificationCode: (await params).code },
    select: { verificationCode: true, issuedAt: true, status: true, revokedAt: true, revocationReason: true, user: { select: { name: true } }, course: { select: { title: true, slug: true } } },
  });
  if (!certificate) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  return NextResponse.json({ data: certificate });
}
