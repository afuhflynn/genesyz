"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WORKSPACE_PLANS } from "@/lib/polar/client";

export default function PricingPage() {
  const plans = Object.values(WORKSPACE_PLANS);

  return (
    <>
      <section className="border-b bg-slate-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Plans for every stage of building.
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Start with a focused founder workspace, then add teammates, AI
            capacity, prototypes, and portfolio operations as you grow.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex flex-col rounded-3xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md ${plan.id === "FOUNDER" ? "border-2 border-primary shadow-lg" : ""}`}
              >
                {plan.id === "FOUNDER" && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    RECOMMENDED
                  </div>
                )}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-primary">
                    {plan.name}
                  </h2>
                  <div className="mt-4 text-4xl font-bold tracking-tight">
                    {plan.price}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {plan.seats} seats · {plan.maxStartups} startup
                    {plan.maxStartups === 1 ? "" : "s"} ·{" "}
                    {plan.aiCredits.toLocaleString()} AI credits · {plan.builderCredits.toLocaleString()} builder generations · {plan.hostedProjectLimit} hosted projects · {formatStorage(plan.storageBytes)} storage
                  </p>
                </div>
                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check className="h-5 w-5 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className="w-full">
                  <Button
                    className="h-12 w-full rounded-xl"
                    variant={plan.id === "EXPLORER" ? "outline" : "default"}
                  >
                    {plan.id === "EXPLORER" ? "Get Started" : "Start building"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Need a cohort or portfolio plan?
            </h2>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
              Accelerators, incubators, and venture programs can manage multiple
              startups with shared learning, growth, and reporting workflows.
            </p>
            <Link
              href="/contact"
              className="font-bold text-primary hover:underline"
            >
              Talk to Genesyz
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function formatStorage(bytes: number) {
  if (bytes < 1024 ** 3) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.round(bytes / 1024 ** 3)} GB`;
}
