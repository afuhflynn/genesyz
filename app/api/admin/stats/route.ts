import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalIdeas, totalResearched, totalCourses, totalEnrollments, totalCertificates] = await Promise.all([
    db.user.count(),
    db.idea.count({ where: { isArchived: false } }),
    db.idea.count({ where: { status: "RESEARCHED", isArchived: false } }),
    db.course.count({ where: { isPublished: true } }),
    db.enrollment.count(),
    db.certificate.count(),
  ]);

  return NextResponse.json({
    totalUsers,
    totalIdeas,
    totalResearched,
    totalCourses,
    totalEnrollments,
    totalCertificates,
  });
}
