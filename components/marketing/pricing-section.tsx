"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PLANS } from "@/lib/polar/client";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6"
          >
            Simple, transparent pricing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Start for free and upgrade as you validate more ideas. No hidden
            fees, no surprises.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto items-stretch">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col p-10 bg-white border rounded-[32px] shadow-sm hover:shadow-xl transition-all"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {PLANS.FREE.name}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Perfect for exploring your first few startup ideas.
              </p>
              <div className="flex items-baseline">
                <span className="text-5xl font-black tracking-tight text-slate-900">
                  $0
                </span>
                <span className="ml-1 text-sm font-bold text-slate-400">
                  /forever
                </span>
              </div>
            </div>
            <ul className="flex-1 space-y-5 mb-10">
              {PLANS.FREE.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm font-medium text-slate-600"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-slate-600" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="w-full">
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl text-lg font-bold border-2"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col p-10 bg-slate-900 text-white border-4 border-primary rounded-[32px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-black rounded-full flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-current" />
              MOST POPULAR
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{PLANS.PRO.name}</h3>
              <p className="text-slate-400 text-sm mb-6">
                For serious entrepreneurs building multiple ventures.
              </p>
              <div className="flex items-baseline">
                <span className="text-5xl font-black tracking-tight">
                  {PLANS.PRO.price.split("/")[0]}
                </span>
                <span className="ml-1 text-sm font-bold text-slate-400">
                  /month
                </span>
              </div>
            </div>
            <ul className="flex-1 space-y-5 mb-10">
              {PLANS.PRO.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm font-medium text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="w-full">
              <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                Go Pro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Need a custom plan for your incubator or VC firm?{" "}
            <Link
              href="/contact"
              className="text-primary font-bold hover:underline"
            >
              Contact sales
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
