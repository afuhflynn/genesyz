import { describe, expect, it } from "vitest";
import {
  HOSTED_HTML_MAX_BYTES,
  getDeploymentProvider,
  slugifyHostedProject,
  staticDeploymentProvider,
} from "./hosting-policy";

describe("hosting provider boundary", () => {
  it("normalizes public project slugs", () => {
    expect(slugifyHostedProject(" My Startup — Landing Page ")).toBe("my-startup-landing-page");
    expect(slugifyHostedProject("!!!")).toBe("prototype");
  });

  it("validates static HTML without executing it", async () => {
    const artifact = await staticDeploymentProvider.build({
      source: "<html><body><script>window.executed = true</script></body></html>",
      manifest: { kind: "static-html" },
    });
    expect(artifact.provider).toBe("static");
    expect(artifact.html).toContain("window.executed");
  });

  it("rejects oversized artifacts and unsupported provider manifests", async () => {
    await expect(
      staticDeploymentProvider.build({
        source: "x".repeat(HOSTED_HTML_MAX_BYTES + 1),
        manifest: { kind: "static-html" },
      }),
    ).rejects.toThrow("2 MB");

    await expect(
      staticDeploymentProvider.build({
        source: "<html></html>",
        manifest: { kind: "server-app" },
      }),
    ).rejects.toThrow("static provider");
  });

  it("fails closed for providers that are not configured", () => {
    expect(() => getDeploymentProvider("unconfigured-provider")).toThrow();
  });
});
