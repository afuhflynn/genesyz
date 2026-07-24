import { randomUUID } from "node:crypto";

export const HOSTED_HTML_MAX_BYTES = 2_000_000;

export type DeploymentManifest = {
  kind: "static-html" | "server-app";
  entrypoint?: string;
  port?: number;
  healthPath?: string;
  runtime?: string;
  allowedEgress?: string[];
};

export type DeploymentArtifact = {
  provider: string;
  artifactId: string;
  manifest: DeploymentManifest;
  html?: string;
};

export interface DeploymentProvider {
  readonly name: string;
  build(input: { source: string; manifest: DeploymentManifest }): Promise<DeploymentArtifact>;
  promote(input: { artifact: DeploymentArtifact; slug: string }): Promise<{ endpoint: string }>;
  rollback(input: { slug: string; artifactId: string }): Promise<void>;
  suspend(input: { slug: string }): Promise<void>;
  destroy(input: { slug: string }): Promise<void>;
}

export const staticDeploymentProvider: DeploymentProvider = {
  name: "static",
  async build({ source, manifest }) {
    if (!source.trim() || Buffer.byteLength(source, "utf8") > HOSTED_HTML_MAX_BYTES) {
      throw new Error("Hosted HTML is empty or exceeds the 2 MB limit");
    }
    if (manifest.kind !== "static-html") {
      throw new Error("The static provider only accepts static HTML releases");
    }
    return { provider: "static", artifactId: randomUUID(), manifest, html: source };
  },
  async promote({ artifact, slug }) {
    return { endpoint: `/hosted/${slug}?release=${artifact.artifactId}` };
  },
  async rollback() {},
  async suspend() {},
  async destroy() {},
};

export function getDeploymentProvider(name = "static"): DeploymentProvider {
  if (name === "static") return staticDeploymentProvider;
  throw new Error(`Deployment provider is not configured: ${name}`);
}

export function slugifyHostedProject(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "prototype";
}
