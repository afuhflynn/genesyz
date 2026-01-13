import { Lightbulb, Rocket, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Our Mission: <br />
            <span className="text-primary">Accelerate Innovation.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We believe the world has too many great ideas that never get built,
            and too many bad ideas that waste years of effort. We're here to fix
            that.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">The IdeasVault Story</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                IdeasVault was born out of the frustration of seeing talented
                founders spend months building products that didn't have a
                market.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We realized that the research phase—the most critical part of
                starting a company—was often skipped because it was too slow,
                too expensive, or too boring. We built IdeasVault to make
                validation instant, data-driven, and accessible to everyone.
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
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Target className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Accuracy First</h3>
              <p className="text-muted-foreground">
                We don't just generate text; we synthesize real-world data to
                provide insights you can actually trust.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Founder Centric</h3>
              <p className="text-muted-foreground">
                Everything we build is designed to save you time and help you
                make better decisions for your business.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Radical Speed</h3>
              <p className="text-muted-foreground">
                In the startup world, speed is life. We aim to turn weeks of
                research into minutes of reading.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
