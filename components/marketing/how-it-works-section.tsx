"use client";

import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Zap,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    title: "Capture",
    description:
      "Describe your idea via text, voice memo, or even a napkin sketch.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    title: "Analyze",
    description:
      "Our AI agents perform deep market research and competitor analysis.",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Synthesize",
    description:
      "Get a comprehensive report with market fit scores and execution plans.",
    icon: BarChart3,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-6"
          >
            From "What if?" to "Here's how."
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            IdeasVault automates the weeks of research required to validate a
            startup idea, giving you clarity in minutes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border shadow-sm hover:shadow-xl transition-all group"
            >
              <div
                className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}
              >
                <step.icon className={`w-10 h-10 ${step.color}`} />
              </div>
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm border-4 border-white">
                {index + 1}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Visualization - UploadThing Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24 p-1 rounded-3xl bg-linear-to-br from-primary/20 via-violet-500/20 to-primary/20 shadow-2xl"
        >
          <div className="bg-white rounded-[22px] p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  <span>THE AI AGENT PIPELINE</span>
                </div>
                <h3 className="text-3xl font-black mb-6">
                  Coordinated Intelligence.
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Our proprietary pipeline coordinates multiple specialized AI
                  agents—Market Research, Trend Analysis, and Execution
                  Friction—to provide a 360-degree view of your idea's
                  potential.
                </p>
                <div className="space-y-4">
                  {[
                    "Real-time market trend identification",
                    "Automated competitor landscape mapping",
                    "Technical feasibility & risk assessment",
                    "Go-to-market strategy synthesis",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 overflow-hidden">
                {/* Animated Agent Nodes */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute w-4/5 h-4/5 border border-slate-200 rounded-full border-dashed"
                  />
                  <div className="absolute w-20 h-20 bg-primary rounded-2xl shadow-2xl flex items-center justify-center z-10">
                    <Zap className="w-10 h-10 text-white" />
                  </div>

                  {/* Orbiting Agents */}
                  {[
                    { icon: Search, color: "bg-blue-500", delay: 0 },
                    { icon: TrendingUp, color: "bg-orange-500", delay: 2 },
                    { icon: ShieldCheck, color: "bg-purple-500", delay: 4 },
                  ].map((agent, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: agent.delay,
                      }}
                      className="absolute w-full h-full flex items-center justify-center"
                    >
                      <div
                        className={`w-12 h-12 ${agent.color} rounded-xl shadow-lg flex items-center justify-center -translate-y-[120px]`}
                      >
                        <agent.icon className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="absolute bottom-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Pipeline Status: Active
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
