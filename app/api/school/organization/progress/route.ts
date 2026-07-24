import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrganizationAccess } from "@/lib/organization-permissions";
import { checkOrganizationCapability, entitlementErrorResponse } from "@/lib/polar/workspace-entitlements";

export async function GET(request: NextRequest) {
  const organizationId = new URL(request.url).searchParams.get("organizationId");
  if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  const access = await getOrganizationAccess(organizationId, true);
  if (!access.allowed) return NextResponse.json({ error: "Organization owner or admin access required" }, { status: 403 });
  try {
    await checkOrganizationCapability(access.user!.id, organizationId, "lmsAnalytics");
  } catch (error) {
    const response = entitlementErrorResponse(error);
    if (response) return response;
    throw error;
  }
  const memberRows = await db.member.findMany({ where: { organizationId }, select: { userId: true, user: { select: { id: true, name: true, email: true, image: true } } } });
  const userIds = memberRows.map((member) => member.userId);
  const [members, assignments, enrollments, certificates, activities, passedQuizzes, streaks] = await Promise.all([
    db.member.findMany({ where: { organizationId }, select: { userId: true, user: { select: { id: true, name: true, email: true, image: true } } } }),
    db.courseAssignment.findMany({ where: { organizationId }, include: { course: { select: { id: true, title: true, slug: true } }, assignee: { select: { id: true, name: true, email: true } } } }),
    db.enrollment.findMany({ where: { userId: { in: userIds } }, include: { course: { select: { id: true, title: true } }, progress: { select: { status: true } } } }),
    db.certificate.count({ where: { userId: { in: userIds }, status: "ACTIVE" } }),
    db.learningActivity.findMany({ where: { userId: { in: userIds }, activityDate: { gte: new Date(Date.now() - 30 * 86400000) } }, select: { userId: true, activityDate: true } }),
    db.quizAttempt.count({ where: { userId: { in: userIds }, passed: true } }),
    db.streak.findMany({ where: { userId: { in: userIds } }, select: { userId: true, currentStreak: true, longestStreak: true } }),
  ]);
  const completed = enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length;
  const overdue = assignments.filter((assignment) => assignment.dueDate && assignment.dueDate < new Date() && assignment.status !== "COMPLETED").length;
  const activeLearnerIds = new Set(activities.map((activity) => activity.userId));
  return NextResponse.json({ data: { members, assignments, enrollments, metrics: { members: members.length, assignments: assignments.length, completed, overdue, certificates, passedQuizzes, activeLearners: activeLearnerIds.size, streaks }, activities } });
}
