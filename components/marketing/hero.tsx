"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PipelineVisualization } from "./pipeline-viz";

export function Hero() {
  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>The AI-Powered Startup Operating System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-[0.9]"
          >
            <span className="text-primary">Validate. Research. Build.</span>
            <br />
            Turn your idea into a startup.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl leading-relaxed"
          >
            Genesyz is your AI co-founder - pressure-test an idea, research the
            market, and then operate your startup with weekly metrics, a
            research feed, and a strategic VC in your corner.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold w-full rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 text-lg font-bold w-full rounded-2xl border-2"
              >
                See How it Works
              </Button>
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-slate-500"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              6-Agent AI Pipeline
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Startup Tracker
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Accelerator Hub
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Team Collaboration
            </span>
          </motion.div>
        </div>

        {/* Pipeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-lg mx-auto"
        >
          <div className="relative rounded-3xl border bg-white/50 backdrop-blur-sm p-6 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-violet-500/5 -z-10" />
            <PipelineVisualization />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
