"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            Genesyz is your AI co-founder — pressure-test an idea, research the
            market, and then operate your startup with weekly metrics, a research
            feed, and a strategic VC Coach in your corner.
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

        {/* Visual Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative max-w-6xl mx-auto"
        >
          <div className="relative rounded-3xl border bg-white/50 backdrop-blur-sm p-4 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-violet-500/5 -z-10" />
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden aspect-video flex flex-col">
              {/* Browser Header */}
              <div className="h-12 border-b bg-slate-50 flex items-center px-6 gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 max-w-md h-7 bg-white border rounded-md mx-auto flex items-center px-3 text-[10px] text-slate-400">
                  genesyz.ai/dashboard
                </div>
              </div>
              {/* Content Placeholder */}
              <div className="flex-1 p-8 flex gap-8">
                <div className="w-1/3 space-y-4">
                  <div className="h-8 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-32 w-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-mono">
                      INPUT: "Uber for Dog Walkers"
                    </span>
                  </div>
                  <div className="h-10 w-full bg-primary/10 rounded-lg" />
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl border p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-32 bg-slate-200 rounded-md" />
                    <div className="h-6 w-16 bg-green-100 rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-white rounded-xl border shadow-sm" />
                    <div className="h-20 bg-white rounded-xl border shadow-sm" />
                    <div className="h-20 bg-white rounded-xl border shadow-sm" />
                  </div>
                  <div className="flex-1 bg-white rounded-xl border p-4 space-y-2">
                    <div className="h-3 w-full bg-slate-100 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    <div className="h-3 w-4/6 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -left-6 bg-white border shadow-xl p-4 rounded-2xl hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold">Market Fit Score</p>
                <p className="text-lg font-black text-green-600">87/100</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute -bottom-6 -right-6 bg-white border shadow-xl p-4 rounded-2xl hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold">Competitors Found</p>
                <p className="text-lg font-black text-blue-600">12 Direct</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
