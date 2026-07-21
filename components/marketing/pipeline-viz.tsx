"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  GitBranch,
  Radar,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";

const agents = [
  { name: "Interpreter", icon: Brain, color: "bg-violet-500" },
  { name: "Market Research", icon: Search, color: "bg-blue-500" },
  { name: "Trend Analysis", icon: TrendingUp, color: "bg-orange-500" },
  { name: "Execution Friction", icon: Radar, color: "bg-rose-500" },
  { name: "Deep Research", icon: GitBranch, color: "bg-cyan-500" },
  { name: "Synthesis", icon: BarChart3, color: "bg-emerald-500" },
];

export function PipelineVisualization({ className }: { className?: string }) {
  const radiusPct = 38;

  return (
    <div
      className={`relative w-full aspect-square max-w-lg mx-auto ${className ?? ""}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-slate-200"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute w-[70%] h-[70%] rounded-full border border-slate-100"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-primary rounded-2xl shadow-2xl flex items-center justify-center z-10"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {agents.map((agent, i) => {
        const angle = (i * 360) / agents.length - 90;
        const rad = (angle * Math.PI) / 180;
        const left = 50 + Math.cos(rad) * radiusPct;
        const top = 50 + Math.sin(rad) * radiusPct;

        return (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3 + i * 0.12,
              type: "spring",
              stiffness: 200,
            }}
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
              className={`w-10 h-10 ${agent.color} rounded-xl shadow-lg flex items-center justify-center`}
            >
              <agent.icon className="w-5 h-5 text-white" />
            </motion.div>
            <span className="mt-1.5 text-[11px] font-semibold text-slate-700 text-center leading-tight whitespace-nowrap">
              {agent.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
