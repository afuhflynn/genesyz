import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Genesyz",
  description:
    "Genesyz privacy policy - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-slate max-w-none">
            <div className="space-y-8">
              <div id="introduction">
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Genesyz (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                  is committed to protecting your privacy. This Privacy Policy
                  explains how we collect, use, disclose, and safeguard your
                  information when you use our platform.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By using Genesyz, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </div>

              <div id="information-collection">
                <h2 className="text-2xl font-bold mb-4">
                  2. Information We Collect
                </h2>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you sign up, we collect your name, email address, and
                  authentication credentials (handled securely via Better Auth).
                  If you sign up with Google OAuth, we receive your name and
                  email from Google.
                </p>
                <h3 className="font-semibold mb-2">Idea & Startup Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We store the ideas, startup profiles, weekly updates, tasks,
                  and other content you create within the platform. This data is
                  tenant-isolated and only accessible by you and your authorized
                  team members.
                </p>
                <h3 className="font-semibold mb-2">Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect anonymous usage statistics to improve the platform.
                  This includes page views, feature usage, and performance
                  metrics via Vercel Analytics.
                </p>
              </div>

              <div id="data-usage">
                <h2 className="text-2xl font-bold mb-4">
                  3. How We Use Your Data
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide and maintain the Genesyz platform</li>
                  <li>Run the AI research pipeline on your ideas</li>
                  <li>
                    Send weekly digest emails (if you opt in as a follower)
                  </li>
                  <li>
                    Send transactional emails (welcome, password reset,
                    verification)
                  </li>
                  <li>Improve platform performance and user experience</li>
                  <li>Enforce usage limits and entitlements</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We do <strong>not</strong> use your proprietary idea data to
                  train our AI models. Your ideas remain your intellectual
                  property.
                </p>
              </div>

              <div id="ai-data">
                <h2 className="text-2xl font-bold mb-4">4. AI Processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you submit an idea for validation, your input is sent to
                  Google Gemini 3.5 Flash via the Vercel AI SDK for processing.
                  Web search data is retrieved via Tavily. Prompts and responses
                  are logged for debugging and quality assurance purposes. These
                  logs are not used for model training.
                </p>
              </div>

              <div id="data-sharing">
                <h2 className="text-2xl font-bold mb-4">
                  5. Data Sharing & Third Parties
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the following third-party services:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Vercel</strong> - hosting and analytics
                  </li>
                  <li>
                    <strong>Neon</strong> - PostgreSQL database
                  </li>
                  <li>
                    <strong>UploadThing</strong> - file storage
                  </li>
                  <li>
                    <strong>Google Gemini</strong> - AI model inference
                  </li>
                  <li>
                    <strong>Tavily</strong> - web search for market research
                  </li>
                  <li>
                    <strong>Polar</strong> - payment and subscription management
                  </li>
                  <li>
                    <strong>Inngest</strong> - background job processing
                  </li>
                  <li>
                    <strong>Resend</strong> - email delivery
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We do not sell your personal data to third parties.
                </p>
              </div>

              <div id="data-security">
                <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures
                  to protect your data, including encryption in transit (TLS)
                  and at rest, strict tenant isolation, and server-side access
                  controls. Authentication is handled by Better Auth with
                  support for email/password and Google OAuth.
                </p>
              </div>

              <div id="data-retention">
                <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your data for as long as your account is active. If
                  you delete your account, your data is permanently deleted
                  within 30 days. Backup data may persist for up to 90 days.
                </p>
              </div>

              <div id="your-rights">
                <h2 className="text-2xl font-bold mb-4">8. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your jurisdiction, you may have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to or restrict processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, contact us at{" "}
                  <a
                    href="mailto:support@genesyz.ai"
                    className="text-primary hover:underline"
                  >
                    support@genesyz.ai
                  </a>
                  .
                </p>
              </div>

              <div id="cookies">
                <h2 className="text-2xl font-bold mb-4">9. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies for authentication and session
                  management. We do not use tracking cookies or third-party
                  advertising cookies. You can control cookie settings through
                  your browser.
                </p>
              </div>

              <div id="changes">
                <h2 className="text-2xl font-bold mb-4">
                  10. Changes to This Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes via email or through the
                  platform. Continued use after changes constitutes acceptance
                  of the updated policy.
                </p>
              </div>

              <div id="contact">
                <h2 className="text-2xl font-bold mb-4">11. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about this Privacy Policy, contact us at{" "}
                  <a
                    href="mailto:support@genesyz.ai"
                    className="text-primary hover:underline"
                  >
                    support@genesyz.ai
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
