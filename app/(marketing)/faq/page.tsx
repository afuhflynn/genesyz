import { SearchBar } from "@/components/faqs/search-bar";
import { FAQSection } from "@/components/marketing/faq-section";

export default function FAQPage() {
  return (
    <>
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Everything you need to know about Genesyz, from idea validation to
            accelerator management.
          </p>
          <SearchBar />
        </div>
      </section>

      <FAQSection />

      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Email us and we'll get back to you as soon as possible.
          </p>
          <a href="mailto:support@genesyz.ai" target="_blank" rel="noopener">
            <button
              type={"button"}
              className="h-14 px-10 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </button>
          </a>
        </div>
      </section>
    </>
  );
}
