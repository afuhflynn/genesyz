import type { Metadata } from "next";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Genesyz",
  description:
    "Genesyz terms of service - the terms governing your use of the Genesyz platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            <div id="acceptance">
              <h2 className="text-2xl font-bold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Genesyz (&quot;the Platform&quot;), you
                agree to be bound by these Terms of Service. If you do not
                agree, do not use the Platform.
              </p>
            </div>

            <div id="description">
              <h2 className="text-2xl font-bold mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Genesyz is an AI-powered startup operating system that provides
                idea validation via a multi-agent AI pipeline, startup execution
                tracking, team collaboration, accelerator program management,
                and portfolio intelligence tools.
              </p>
            </div>

            <div id="accounts">
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You must create an account to use the Platform. You are
                responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Maintaining the confidentiality of your credentials</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of unauthorized access</li>
                <li>
                  Providing accurate and complete registration information
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You must be at least 18 years old to use the Platform.
              </p>
            </div>

            <div id="subscriptions">
              <h2 className="text-2xl font-bold mb-4">
                4. Subscriptions & Billing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Platform offers Free and Pro subscription plans. Payments
                are processed securely by Polar. By subscribing to a paid plan,
                you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Pay all fees associated with your chosen plan</li>
                <li>Provide accurate billing information</li>
                <li>Automatic renewal of your subscription</li>
                <li>Our refund policy as described in the Platform</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Free tier: up to 3 active ideas. Pro tier ($20/month): unlimited
                ideas.
              </p>
            </div>

            <div id="acceptable-use">
              <h2 className="text-2xl font-bold mb-4">5. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Platform for any illegal purpose</li>
                <li>Attempt to access another user&apos;s account or data</li>
                <li>Reverse engineer or tamper with the Platform</li>
                <li>
                  Submit content that infringes intellectual property rights
                </li>
                <li>Use automated means to access or scrape the Platform</li>
                <li>Interfere with the proper functioning of the Platform</li>
              </ul>
            </div>

            <div id="intellectual-property">
              <h2 className="text-2xl font-bold mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>Your Content:</strong> You retain all rights to the
                ideas, startup data, and content you create on Genesyz. We claim
                no ownership over your intellectual property.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Our Platform:</strong> Genesyz, including its code,
                design, branding, and AI models (as implemented), is our
                intellectual property. You may not copy, modify, or redistribute
                the Platform without written permission.
              </p>
            </div>

            <div id="ai-disclaimer">
              <h2 className="text-2xl font-bold mb-4">7. AI Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Genesyz uses AI (Google Gemini 3.5 Flash) to generate research
                and analysis.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                AI-generated content may contain errors, omissions, or
                inaccuracies. You should independently verify critical
                information before making business decisions. Genesyz is a tool
                to assist decision-making, not a substitute for professional
                advice, due diligence, or primary research.
              </p>
            </div>

            <div id="limitation-liability">
              <h2 className="text-2xl font-bold mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Genesyz shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of the Platform. The
                Platform is provided &quot;as is&quot; without warranty of any
                kind.
              </p>
            </div>

            <div id="termination">
              <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account for
                violation of these terms. You may cancel your account at any
                time. Upon termination, your data will be deleted within 30
                days.
              </p>
            </div>

            <div id="changes">
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these terms at any time. We will notify you of
                material changes via email or through the Platform. Continued
                use after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            <div id="contact">
              <h2 className="text-2xl font-bold mb-4">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these terms, contact us at{" "}
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
      </section>
    </div>
  );
}
