import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FAQSection } from "@/components/marketing/faq-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* Social Proof / Trusted By */}
      <section className="py-12 border-y bg-slate-50/30 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Empowering entrepreneurs at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="text-xl font-bold">STARTUP HUB</div>
            <div className="text-xl font-bold">TECH VENTURES</div>
            <div className="text-xl font-bold">IDEA LAB</div>
            <div className="text-xl font-bold">NEXUS INC</div>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
            Ready to validate your next big idea?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join hundreds of founders who use Genesyz to save months of
            wasted effort and build with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-10 text-lg font-bold"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 text-lg bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-70">
            No credit card required. Start with 3 free idea validations.
          </p>
        </div>
      </section>
    </>
  );
}
