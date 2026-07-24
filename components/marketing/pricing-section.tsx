"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WORKSPACE_PLANS } from "@/lib/polar/client";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-background py-24"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl font-black tracking-tight md:text-5xl"
          >
            One operating system, every stage.
          </motion.h2>
          <p className="text-lg text-slate-600">
            Start free, then add collaboration, AI capacity, prototypes, and
            portfolio operations as your startup ecosystem grows.
          </p>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Object.values(WORKSPACE_PLANS).map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`flex flex-col rounded-[32px] border bg-white p-8 shadow-sm transition-all hover:shadow-xl ${plan.id === "FOUNDER" ? "border-4 border-primary" : ""}`}
            >
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                {plan.name}
              </h3>
              <p className="mb-6 text-sm text-slate-500">
                {plan.seats} seats · {plan.maxStartups} startup
                {plan.maxStartups === 1 ? "" : "s"}
              </p>
              <p className="mb-6 text-xs text-slate-500">
                {plan.aiCredits.toLocaleString()} AI credits · {plan.builderCredits.toLocaleString()} builder generations · {plan.hostedProjectLimit} hosted projects · {formatStorage(plan.storageBytes)} storage
              </p>
              <div className="mb-8 text-4xl font-black tracking-tight text-slate-900">
                {plan.price}
              </div>
              <ul className="mb-10 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm font-medium text-slate-600"
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full">
                <Button
                  variant={plan.id === "EXPLORER" ? "outline" : "default"}
                  className="h-14 w-full rounded-2xl text-lg font-bold"
                >
                  {plan.id === "EXPLORER" ? "Get Started" : "Start building"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm font-medium text-slate-500">
          Need a custom plan for your incubator or VC firm?{" "}
          <Link
            href="/contact"
            className="font-bold text-primary hover:underline"
          >
            Contact sales
          </Link>
        </p>
      </div>
    </section>
  );
}

function formatStorage(bytes: number) {
  if (bytes < 1024 ** 3) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.round(bytes / 1024 ** 3)} GB`;
}
