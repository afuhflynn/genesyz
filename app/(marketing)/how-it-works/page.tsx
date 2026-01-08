import {
  Search,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Cpu,
  Database,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 bg-slate-50 dark:bg-transparent border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            How IdeasVault Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our multi-agent AI pipeline performs deep research so you don't have
            to. Here's the science behind the validation.
          </p>
        </div>
      </section>

      {/* The Pipeline */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">The AI Agent Pipeline</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                When you submit an idea, we don't just ask a single LLM for its
                opinion. We trigger a coordinated pipeline of specialized
                agents, each with a specific mission.
              </p>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Search className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Market Research Agent
                    </h3>
                    <p className="text-muted-foreground">
                      Scours the web for existing solutions, identifies
                      competitors, and maps out the current market landscape.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="text-orange-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Trend Analysis Agent
                    </h3>
                    <p className="text-muted-foreground">
                      Analyzes search trends, social sentiment, and industry
                      reports to see if your idea is riding a wave or fighting
                      the tide.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-purple-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Execution Friction Agent
                    </h3>
                    <p className="text-muted-foreground">
                      Evaluates technical difficulty, regulatory hurdles, and
                      operational risks to give you a realistic difficulty
                      score.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center p-8">
                <div className="text-center">
                  <Cpu className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-500 font-mono text-sm">
                    [Pipeline Visualization: Data Flowing through Agents]
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Synthesis */}
      <section className="py-24 bg-slate-50 dark:bg-transparent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <BarChart3 className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-6">The Synthesis Report</h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Finally, our Synthesis Agent takes all the raw data from the
            pipeline and distills it into an actionable report. You get a clear
            "Go/No-Go" recommendation, a list of critical risks, and a
            step-by-step plan to build your MVP.
          </p>
          <div className="bg-white p-8 rounded-3xl border shadow-sm text-left">
            <h4 className="font-bold mb-4">What's in the report?</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Market Fit Score (0-100)",
                "Competitor Matrix",
                "Target Audience Personas",
                "Technical Implementation Plan",
                "Monetization Strategy",
                "Risk Mitigation Roadmap",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">
            Powered by Real-World Data
          </h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Database className="w-6 h-6" /> GOOGLE SEARCH
            </div>
            <div className="flex items-center gap-2 font-bold text-xl">
              <Database className="w-6 h-6" /> REDDIT API
            </div>
            <div className="flex items-center gap-2 font-bold text-xl">
              <Database className="w-6 h-6" /> CRUNCHBASE
            </div>
            <div className="flex items-center gap-2 font-bold text-xl">
              <Database className="w-6 h-6" /> GITHUB TRENDS
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
