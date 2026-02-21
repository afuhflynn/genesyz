import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkSlugSchema } from "@/lib/validators/startup";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkSlugSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid slug format", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await db.startup.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
