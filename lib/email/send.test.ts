import { describe, expect, it } from "vitest";
import {
  getEmailBranding,
  renderPremiumEmail,
  resolveVerificationCodeDisplay,
} from "./send";

describe("email branding", () => {
  it("uses a consistent branded logo identifier", () => {
    const branding = getEmailBranding();

    expect(branding.appName).toBe("Genesyz");
    expect(branding.logoCid).toBe("genesyz-logo");
  });

  it("renders with the shared brand palette in the premium email layout", () => {
    const html = renderPremiumEmail({
      title: "Test Email",
      contentHtml: "<p>Body</p>",
      badge: "Brand",
    });

    expect(html).toContain("Genesyz");
    expect(html).toContain("cid:genesyz-logo");
    expect(html).toContain("#f59e0b");
  });

  it("falls back to the token when an explicit verification code is missing", () => {
    expect(resolveVerificationCodeDisplay(undefined, "abc123token")).toBe(
      "abc123token",
    );
  });
});
