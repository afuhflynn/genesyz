import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  type DeploymentArtifact,
  type DeploymentManifest,
  type DeploymentProvider,
  getDeploymentProvider,
  slugifyHostedProject,
} from "./hosting-policy";
export { HOSTED_HTML_MAX_BYTES, staticDeploymentProvider } from "./hosting-policy";
export type { DeploymentArtifact, DeploymentManifest, DeploymentProvider } from "./hosting-policy";
export const HOSTED_PROJECT_STATUSES = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export const HOSTED_RELEASE_STATUSES = [
  "BUILDING",
  "VALIDATED",
  "LIVE",
  "FAILED",
  "ROLLED_BACK",
] as const;


export function hostedProjectUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_HOSTED_BASE_URL?.replace(/\/$/, "");
  return base ? `${base}/${slug}` : `/hosted/${slug}`;
}

export async function publishPrototypeAsHostedProject(input: {
  organizationId: string;
  startupId: string;
  prototypeId: string;
  prototypeName: string;
  html: string;
  hostedProjectLimit: number;
  providerName?: string;
}) {
  const provider = getDeploymentProvider(input.providerName);
  const artifact = await provider.build({
    source: input.html,
    manifest: { kind: "static-html" },
  });

  return db.$transaction(async (tx) => {
    const existing = await tx.hostedProject.findUnique({
      where: { prototypeId: input.prototypeId },
      include: { releases: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!existing) {
      const activeProjects = await tx.hostedProject.count({
        where: { organizationId: input.organizationId, status: "ACTIVE" },
      });
      if (activeProjects >= input.hostedProjectLimit) {
        throw new Error("HOSTED_PROJECT_LIMIT");
      }
    }

    const project = existing ?? (await tx.hostedProject.create({
      data: {
        organizationId: input.organizationId,
        startupId: input.startupId,
        prototypeId: input.prototypeId,
        slug: `${slugifyHostedProject(input.prototypeName)}-${input.prototypeId.slice(-6).toLowerCase()}`,
        provider: provider.name,
        route: {
          create: { slug: `${slugifyHostedProject(input.prototypeName)}-${input.prototypeId.slice(-6).toLowerCase()}` },
        },
      },
      include: { releases: { orderBy: { version: "desc" }, take: 1 } },
    }));

    const version = (existing?.releases[0]?.version ?? 0) + 1;
    const release = await tx.hostedRelease.create({
      data: {
        projectId: project.id,
        prototypeId: input.prototypeId,
        version,
        provider: provider.name,
        status: "LIVE",
        html: artifact.html ?? input.html,
        manifest: artifact.manifest as Prisma.InputJsonValue,
        promotedAt: new Date(),
        events: {
          create: [
            { type: "VALIDATED", message: "Static HTML passed release validation" },
            { type: "PROMOTED", message: "Release promoted to the public route" },
          ],
        },
      },
    });

    const updatedProject = await tx.hostedProject.update({
      where: { id: project.id },
      data: {
        status: "ACTIVE",
        activeReleaseId: release.id,
        route: { update: { status: "ACTIVE" } },
      },
      include: { route: true, activeRelease: true },
    });

    await tx.prototype.update({
      where: { id: input.prototypeId },
      data: { status: "LIVE", publishedAt: new Date() },
    });

    return updatedProject;
  }, { isolationLevel: "Serializable" });
}

export async function getHostedProjectBySlug(slug: string) {
  return db.hostedProject.findFirst({
    where: { slug, status: "ACTIVE", route: { slug, status: "ACTIVE" } },
    include: { activeRelease: true, route: true },
  });
}
