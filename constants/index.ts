export const faqs = [
  {
    question: "How does the AI idea validation work?",
    answer:
      "Genesyz uses a 6-agent AI research pipeline. When you submit an idea, specialized agents are triggered sequentially: an Interpreter structures your input, Market Research analyzes TAM/SAM/SOM and competitors, Trend Analysis checks timing and technology readiness, Execution Friction assesses complexity and risks, Deep Research performs web search via Tavily for market validation, and finally a Synthesis agent combines everything into a final score and verdict. Progress is streamed in real-time.",
  },
  {
    question: "What's the difference between idea validation and startup tracking?",
    answer:
      "Idea validation is the first step — our AI pipeline researches your concept and gives you a Go/Pause/Kill verdict with supporting data. Once validated, you can convert your idea into a startup profile and begin tracking execution: weekly check-ins with AI coaching, Kanban task boards, metrics dashboards, streak gamification, and team collaboration. Think of validation as the 'should I build this?' phase and tracking as the 'how do I build it?' phase.",
  },
  {
    question: "What is the Accelerator Hub?",
    answer:
      "The Accelerator Hub is a full program management system for running startup accelerators and incubators. You can create programs, manage cohorts with onboarding flows, schedule events (workshops, mentor sessions, demo days), manage mentor-startup matching, track KPIs with progress bars, submit weekly manager reports with AI summaries, and generate investor one-pagers. It's designed for program managers who run early-stage startup programs.",
  },
  {
    question: "Can I collaborate with my team?",
    answer:
      "Yes. You can add team members to your startup with 4 role levels: OWNER, ADMIN, MEMBER, and VIEWER. You can also add external followers who receive weekly digest emails with updates on your startup's progress. All member and follower changes are audit-logged.",
  },
  {
    question: "What is the Opportunities Board?",
    answer:
      "The Opportunities Board automatically discovers funding opportunities, fellowships, grants, accelerators, and competitions via daily web search (powered by Tavily). Each opportunity flows through a 7-stage pipeline: DISCOVERED → BOOKMARKED → TO_APPLY → APPLIED → INTERVIEWING → ACCEPTED or REJECTED. Duplicates are automatically prevented.",
  },
  {
    question: "How does the AI Coach work?",
    answer:
      "The AI Coach analyzes your weekly check-in updates and provides a VC-style assessment with verdicts of ON_TRACK, NEEDS_ATTENTION, or AT_RISK. It highlights positives, concerns, blind spots, trajectory, and action recommendations. For accelerator managers, there's also a Hub Coach that does cohort-wide health analysis with pattern detection and KPI forecasting.",
  },
  {
    question: "What kind of inputs can I provide for idea validation?",
    answer:
      "Currently, you can provide text descriptions. Voice memo uploads and image/OCR inputs are available in the UI as a Beta feature — they are being connected to production-grade storage. Text input is fully supported and drives the complete 6-agent pipeline.",
  },
  {
    question: "Is my idea data secure and private?",
    answer:
      "Yes. Your data is tenant-isolated — no cross-user access is possible. We do not use your proprietary idea data to train our base AI models. All entitlements and access controls are enforced server-side.",
  },
  {
    question: "What AI model powers Genesyz?",
    answer:
      "Genesyz uses Google Gemini 3.5 Flash via the Vercel AI SDK v7. If structured generation fails due to schema constraints, we fall back to text generation with smart JSON parsing. This single-model approach ensures consistent, reliable output quality.",
  },
  {
    question: "Can I export my research reports?",
    answer:
      "Yes. You can export the full research synthesis as a professional PDF report, including the executive summary, AI assessment scores, final verdict, and key recommendations. The PDF is generated server-side and stored via UploadThing.",
  },
  {
    question: "How does pricing work?",
    answer:
      "The Free plan gives you up to 3 active ideas with full access to all features. The Pro plan at $20/month removes the idea limit and includes priority support. There are no hidden fees or surprises.",
  },
  {
    question: "What is the Startup Execution Tracker?",
    answer:
      "Once you validate an idea, you can convert it into a startup profile with a defined stage lifecycle (IDEA → VALIDATION → BUILDING → LAUNCHED → SCALING). You can submit weekly check-ins tracking 34+ metric types across revenue, engagement, marketplace, growth, special, and custom categories. Each update gets AI-powered analysis. You also get Kanban task boards, streak milestones, goals, and metrics dashboards.",
  },
  {
    question: "Can investors or mentors follow my startup?",
    answer:
      "Yes. You can add external followers (investors, mentors, advisors) who receive automated weekly digest emails summarizing your startup's progress. This is a great way to keep stakeholders informed without manual reporting.",
  },
  {
    question: "What data sources does the AI research use?",
    answer:
      "The research pipeline uses web search powered by Tavily for market validation, competitor research, and trend analysis. The AI models are trained on broad public data and can reason about market dynamics, technical feasibility, and execution risks based on the information available.",
  },
  {
    question: "How accurate is the AI research?",
    answer:
      "AI provides a powerful starting point for validation, but it should complement — not replace — your own primary research and customer interviews. Use our reports to identify blind spots, validate assumptions, and guide your go-to-market strategy.",
  },
];
