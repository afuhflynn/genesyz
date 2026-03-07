import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAcceleratorAccess } from "@/lib/accelerator-permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "view_startups",
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mentors = await db.mentor.findMany({
    where: { acceleratorId },
    include: {
      matches: {
        include: {
          startup: { select: { name: true, id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: mentors });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { hasAccess, acceleratorId } = await checkAcceleratorAccess(
    slug,
    "manage_team", // Mentors are considered high-level staff
  );

  if (!hasAccess || !acceleratorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, expertise, bio, linkedIn } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );
  }

  const mentor = await db.mentor.create({
    data: {
      acceleratorId,
      name,
      email,
      expertise: expertise || [],
      bio,
      linkedIn,
    },
  });

  return NextResponse.json({ data: mentor }, { status: 201 });
}
