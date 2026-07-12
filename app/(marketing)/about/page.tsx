import {
  Building2,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Genesyz: The <br />
            <span className="text-primary">Startup Operating System.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From idea to exit. Genesyz helps founders validate, track, and scale
            their startups - all in one platform.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">The Genesyz Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Genesyz was built for founders who need more than an idea
                validator. The insight was simple: validation is just the first
                step. Once you know your idea has potential, you need to execute
                - and execution is where most startups fail.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                So we built a complete operating system. A 6-agent AI pipeline
                validates your idea. A startup execution tracker helps you ship.
                Team collaboration keeps everyone aligned. The Accelerator Hub
                connects you with programs that can grow your startup.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Genesyz is the platform we wished existed when we were building
                our own startups.
              </p>
            </div>
            <div className="bg-slate-100 aspect-video rounded-3xl flex items-center justify-center">
              <Rocket className="w-20 h-20 text-slate-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            What Genesyz Does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Lightbulb className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">AI Idea Validation</h3>
              <p className="text-sm text-muted-foreground">
                Submit any idea and get instant market research, competitor
                analysis, timing assessment, and a Go/Pause/Kill verdict from
                our 6-agent AI pipeline.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <TrendingUp className="text-green-500 w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Startup Execution Tracker</h3>
              <p className="text-sm text-muted-foreground">
                Convert validated ideas into startup profiles. Track weekly
                updates with 34+ metrics, Kanban tasks, goals, and streaks. Get
                AI-powered coaching on every update.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
                <Users className="text-violet-500 w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work with your team using 4 role levels (OWNER, ADMIN, MEMBER,
                VIEWER). Invite external followers who receive weekly digest
                updates.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <Target className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Opportunities Board</h3>
              <p className="text-sm text-muted-foreground">
                Automatically discover funding, fellowships, grants,
                accelerators, and competitions. Track through a 7-stage pipeline
                from discovery to acceptance.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <Building2 className="text-emerald-500 w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Accelerator Hub</h3>
              <p className="text-sm text-muted-foreground">
                Full program management for accelerators and incubators:
                cohorts, events, mentors, KPIs, weekly reports, and investor
                one-pagers. RBAC with 5 role levels.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
                <Rocket className="text-rose-500 w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Portfolio Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Strategic Advisory Agent gives portfolio-level Go/Pause/Kill
                verdicts. Weekly reports and monthly re-evaluations keep your
                pipeline healthy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
