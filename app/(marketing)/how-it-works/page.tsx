import {
  BarChart3,
  Brain,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Waypoints,
} from "lucide-react";

const agents = [
  {
    name: "Interpreter Agent",
    description:
      "Structures your raw input - whether a sentence, a paragraph, or a collection of notes - into a clear title, problem statement, solution, and category. It's the foundation everything else builds on.",
    icon: Brain,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    name: "Market Research Agent",
    description:
      "Analyzes total addressable market (TAM), serviceable market (SAM), and serviceable obtainable market (SOM) with dual-currency support. Identifies competitors, barriers to entry, and growth rate projections.",
    icon: Search,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    name: "Trend Analysis Agent",
    description:
      "Produces a timing verdict - too early, right time, late, or too late - along with a technology readiness score from 1-10. Flags emerging trends and industry shifts.",
    icon: TrendingUp,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    name: "Execution Friction Agent",
    description:
      "Assesses technical complexity, resource estimates, regulatory hurdles, and operational risks. Identifies quick wins and the biggest blockers to shipping.",
    icon: ShieldCheck,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    name: "Deep Research Agent",
    description:
      "Performs web search via Tavily to find market gaps, real-world validation data, and competitive intelligence. Generates a 3-phase roadmap and pivot options.",
    icon: Waypoints,
    color: "text-cyan-500",
    bg: "bg-cyan-50",
  },
  {
    name: "Synthesis Agent",
    description:
      "Combines all agent outputs into a final verdict (pursue-immediately, pursue, consider-with-caution, pause, not-recommended), overall score (0-100), and actionable recommendations.",
    icon: BarChart3,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="py-20 bg-slate-50 dark:bg-transparent border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-6">
            <Sparkles className="w-3 h-3" />
            <span>POWERED BY GEMINI 3.5 FLASH</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            How Genesyz Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A coordinated 6-agent AI pipeline researches your idea from every
            angle, streamed in real-time through Inngest.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">
            The 6-Agent Pipeline
          </h2>
          <div className="space-y-12">
            {agents.map((agent, index) => (
              <div key={agent.name} className="flex gap-6">
                <div className="hidden md:flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl ${agent.bg} flex items-center justify-center shrink-0`}>
                    <agent.icon className={`w-7 h-7 ${agent.color}`} />
                  </div>
                  {index < agents.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 md:hidden">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 dark:bg-transparent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <BarChart3 className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-6">The Synthesis Report</h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            The Synthesis Agent combines all agent outputs into a comprehensive
            report. You get a clear verdict, scores, risks, and an actionable
            next step.
          </p>
          <div className="bg-white p-8 rounded-3xl border shadow-sm text-left">
            <h4 className="font-bold mb-4">Your report includes:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Overall Score (0-100)",
                "Clarity, Market, and Execution scores",
                "Final Verdict (5 levels)",
                "Key Recommendations with priorities",
                "Critical Risks and Blind Spots",
                "Go-to-Market Roadmap",
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

      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-6">
            Beyond Validation
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Validation is just the beginning. Genesyz also handles execution,
            team collaboration, accelerator programs, and portfolio intelligence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Execution Tracker",
                items: ["Weekly updates with AI coaching", "Kanban task boards", "Streak gamification", "34+ metric types"],
              },
              {
                title: "Accelerator Hub",
                items: ["Program & cohort management", "Event scheduling with RSVP", "Mentor matching", "KPI tracking & reports"],
              },
              {
                title: "Opportunities",
                items: ["AI-discovered funding", "7-stage pipeline", "Automated deduplication", "Daily web search cron"],
              },
            ].map((col) => (
              <div key={col.title} className="p-6 rounded-2xl border bg-white">
                <h3 className="font-bold mb-4">{col.title}</h3>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
