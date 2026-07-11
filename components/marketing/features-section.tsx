"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Building2,
  FileText,
  GitPullRequest,
  Globe,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Waypoints,
  Zap,
} from "lucide-react";

const featureCategories = [
  {
    title: "Validate",
    description: "Research and validate your startup idea with AI.",
    features: [
      {
        title: "6-Agent AI Pipeline",
        description:
          "Interpreter, Market Research, Trend Analysis, Execution Friction, Deep Research, and Synthesis agents collaborate in real-time.",
        icon: Brain,
        color: "text-blue-500",
        bg: "bg-blue-50",
      },
      {
        title: "Market Sizing",
        description:
          "Get TAM/SAM/SOM analysis with dual-currency support for your target market, competitor mapping, and growth rate projections.",
        icon: Target,
        color: "text-purple-500",
        bg: "bg-purple-50",
      },
      {
        title: "Guide Agent",
        description:
          "Ask follow-up questions about your research. Our per-idea Guide Agent maintains context and answers across multiple sessions.",
        icon: Waypoints,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
      },
      {
        title: "PDF Reports",
        description:
          "Export comprehensive research syntheses as professional PDF reports to share with co-founders, investors, or mentors.",
        icon: FileText,
        color: "text-green-500",
        bg: "bg-green-50",
      },
    ],
  },
  {
    title: "Track",
    description: "Execute with purpose. Track progress, not just tasks.",
    features: [
      {
        title: "Weekly Updates",
        description:
          "Log 34+ metrics across revenue, engagement, marketplace, growth, and custom categories. Each update gets AI-powered analysis with verdicts.",
        icon: BarChart3,
        color: "text-orange-500",
        bg: "bg-orange-50",
      },
      {
        title: "AI Coach",
        description:
          "Get VC-style feedback on every weekly update: ON_TRACK, NEEDS_ATTENTION, or AT_RISK. The AI highlights blind spots and recommends actions.",
        icon: Sparkles,
        color: "text-amber-500",
        bg: "bg-amber-50",
      },
      {
        title: "Kanban Tasks",
        description:
          "Drag-and-drop task boards with 4 status columns: TODO, IN_PROGRESS, BLOCKED, DONE. Set deadlines and track progress.",
        icon: GitPullRequest,
        color: "text-cyan-500",
        bg: "bg-cyan-50",
      },
      {
        title: "Streaks & Goals",
        description:
          "Stay motivated with streak milestones at 4/8/12/16/20/24/52 weeks. Set unlimited goals with priority levels.",
        icon: TrendingUp,
        color: "text-rose-500",
        bg: "bg-rose-50",
      },
    ],
  },
  {
    title: "Grow",
    description: "Scale with your team and discover opportunities.",
    features: [
      {
        title: "Team Collaboration",
        description:
          "Add team members with 4 role levels (OWNER, ADMIN, MEMBER, VIEWER). Invite external followers who receive weekly digest emails.",
        icon: Users,
        color: "text-violet-500",
        bg: "bg-violet-50",
      },
      {
        title: "Opportunities Board",
        description:
          "AI-discovered funding opportunities, fellowships, accelerators, and grants — updated daily via web search. Track through a 7-stage pipeline.",
        icon: Globe,
        color: "text-sky-500",
        bg: "bg-sky-50",
      },
      {
        title: "Accelerator Hub",
        description:
          "Full program management for accelerators and incubators. Cohorts, events, mentors, KPIs, weekly reports, investor one-pagers.",
        icon: Building2,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      },
      {
        title: "Portfolio Intelligence",
        description:
          "Strategic Advisory Agent provides portfolio-level Go/Pause/Kill verdicts. Weekly reports and monthly re-evaluations.",
        icon: Zap,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
      },
    ],
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
            Genesyz is a complete startup operating system — from first idea to
            scaling execution, team collaboration, and accelerator programs.
          </motion.p>
        </div>

        {featureCategories.map((category, catIndex) => (
          <div key={category.title} className="mb-20 last:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-4">
                <span>{category.title}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {category.title}
              </h3>
              <p className="text-slate-500">{category.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-[24px] border bg-white hover:border-primary/50 hover:shadow-xl transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h4 className="text-base font-bold mb-2 text-slate-900">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
