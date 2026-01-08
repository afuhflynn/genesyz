"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Search,
  TrendingUp,
  FileText,
  Globe,
  Lock,
} from "lucide-react";

const features = [
  {
    title: "Instant Market Analysis",
    description:
      "Get a comprehensive breakdown of your target market, size, and potential in seconds.",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Competitor Mapping",
    description:
      "Identify direct and indirect competitors and see how your idea stacks up.",
    icon: ShieldCheck,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    title: "Trend Identification",
    description:
      "Stay ahead of the curve with real-time trend data from across the web.",
    icon: TrendingUp,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    title: "Execution Roadmap",
    description:
      "Receive a step-by-step plan to build your MVP and launch your product.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    title: "Professional PDF Reports",
    description:
      "Export your research into beautiful PDFs to share with investors or partners.",
    icon: FileText,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    title: "Global Data Sources",
    description:
      "Our agents scour Google, Reddit, Crunchbase, and more for the best insights.",
    icon: Globe,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6"
          >
            Everything you need to <br />
            <span className="text-primary">build with confidence.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            IdeasVault provides a complete toolkit for modern entrepreneurs to
            validate, research, and plan their next venture.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-[32px] border bg-white hover:border-primary/50 hover:shadow-xl transition-all group"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
