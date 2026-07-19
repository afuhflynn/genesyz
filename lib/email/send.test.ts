import { describe, expect, it } from "vitest";
import {
  buildEmailButton,
  buildEmailCard,
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
    expect(html).toContain("https://res.cloudinary.com/duzg7l0eo/image/upload");
    expect(html).toContain("#ea580c");
    expect(html).toContain("max-width: 640px");
    expect(html).toContain("word-break: break-word");
    expect(html).toContain("Manage Preferences");
  });

  it("builds reusable visual primitives for consistent email content", () => {
    const button = buildEmailButton({
      href: "https://example.com",
      label: "Continue",
    });
    const card = buildEmailCard({ children: "<p>Body</p>" });

    expect(button).toContain("background:");
    expect(button).toContain("Continue");
    expect(card).toContain("border-radius: 16px");
    expect(card).toContain("<p>Body</p>");
  });

  it("falls back to the token when an explicit verification code is missing", () => {
    expect(resolveVerificationCodeDisplay(undefined, "abc123token")).toBe(
      "abc123token",
    );
  });
});
