"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/polar/client";

export default function PricingPage() {
  return (
    <>
      <section className="py-24 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All features included from day one. Start free, upgrade when you
            need more ideas. No hidden fees.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 ">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col p-8 bg-white border rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {PLANS.FREE.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight">$0</span>
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">
                    /forever
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Up to 3 active ideas. All features included.
                </p>
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                {PLANS.FREE.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col p-8 bg-white border-2 border-primary rounded-3xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-bl-xl">
                POPULAR
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-primary">
                  {PLANS.PRO.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight">
                    {PLANS.PRO.price.split("/")[0]}
                  </span>
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Unlimited ideas and priority support.
                </p>
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                {PLANS.PRO.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="w-full">
                <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20">
                  Go Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <div className="mt-24 ">
            <h2 className="text-3xl font-bold text-center mb-16">
              Compare Plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-4 px-6 text-sm font-semibold">Feature</th>
                    <th className="py-4 px-6 text-sm font-semibold text-center">
                      Free
                    </th>
                    <th className="py-4 px-6 text-sm font-semibold text-center text-primary">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    {
                      name: "Active Ideas",
                      free: "3",
                      pro: "Unlimited",
                    },
                    {
                      name: "6-Agent AI Research Pipeline",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Real-time Progress Streaming",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Per-Idea Guide Agent",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Startup Execution Tracker",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "AI Coach (Weekly Updates)",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Kanban Task Boards",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Streak Gamification",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Team Collaboration",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Opportunities Board",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Accelerator Hub Access",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "PDF Exports",
                      free: "Yes",
                      pro: "Yes",
                    },
                    {
                      name: "Voice Memo Uploads",
                      free: "Beta",
                      pro: "Beta",
                    },
                    {
                      name: "Image / OCR Inputs",
                      free: "Beta",
                      pro: "Beta",
                    },
                    {
                      name: "Support",
                      free: "Email",
                      pro: "Priority",
                    },
                  ].map((row, i) => (
                    <tr
                      key={`${row.name}-${i}`}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium">{row.name}</td>
                      <td className="py-4 px-6 text-center text-muted-foreground">
                        {row.free}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold">
                        {row.pro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Need a custom plan for your incubator or VC firm?{" "}
              <Link
                href="/contact"
                className="text-primary font-bold hover:underline"
              >
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
