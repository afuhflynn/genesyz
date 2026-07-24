import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrganizationAccess } from "@/lib/organization-permissions";

export async function GET(request: NextRequest) {
  const organizationId = new URL(request.url).searchParams.get("organizationId");
  if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  const access = await getOrganizationAccess(organizationId);
  if (!access.allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const assignments = await db.courseAssignment.findMany({ where: { organizationId, OR: [{ assigneeId: access.user!.id }, { assigneeId: null }] }, include: { course: { select: { id: true, title: true, slug: true, thumbnail: true } }, assignee: { select: { id: true, name: true, email: true } } }, orderBy: { dueDate: "asc" } });
  return NextResponse.json({ data: assignments });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const access = await getOrganizationAccess(body.organizationId, true);
  if (!access.allowed) return NextResponse.json({ error: "Organization owner or admin access required" }, { status: 403 });
  const course = await db.course.findFirst({ where: { id: body.courseId, isPublished: true }, select: { id: true } });
  if (!course) return NextResponse.json({ error: "Published course not found" }, { status: 404 });
  const assigneeIds: Array<string | null> = Array.isArray(body.assigneeIds) && body.assigneeIds.length ? body.assigneeIds.filter((id: unknown): id is string => typeof id === "string") : [null];
  const members = await db.member.findMany({ where: { organizationId: body.organizationId, userId: { in: assigneeIds.filter((id): id is string => !!id) } }, select: { userId: true } });
  if (members.length !== assigneeIds.filter((id): id is string => !!id).length) return NextResponse.json({ error: "One or more assignees are not organization members" }, { status: 400 });
  const assignmentData = { required: body.required !== false, dueDate: body.dueDate ? new Date(body.dueDate) : null };
  const assignments = await Promise.all(assigneeIds.map(async (assigneeId) => {
    if (!assigneeId) {
      const existing = await db.courseAssignment.findFirst({ where: { organizationId: body.organizationId, courseId: body.courseId, assigneeId: null } });
      return existing ? db.courseAssignment.update({ where: { id: existing.id }, data: { ...assignmentData, status: "ASSIGNED" } }) : db.courseAssignment.create({ data: { organizationId: body.organizationId, courseId: body.courseId, assigneeId: null, ...assignmentData } });
    }
    return db.courseAssignment.upsert({ where: { organizationId_courseId_assigneeId: { organizationId: body.organizationId, courseId: body.courseId, assigneeId } }, create: { organizationId: body.organizationId, courseId: body.courseId, assigneeId, ...assignmentData }, update: { ...assignmentData, status: "ASSIGNED" } });
  }));
  return NextResponse.json({ data: assignments }, { status: 201 });
}
