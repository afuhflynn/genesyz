import { SearchBar } from "@/components/faqs/search-bar";
import { FAQSection } from "@/components/marketing/faq-section";
import { FAQsTips } from "@/constants";

export default function FAQPage() {
  return (
    <>
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Have questions? We're here to help you get the most out of
            IdeasVault.
          </p>
          <SearchBar />
        </div>
      </section>

      <FAQSection />

      <section className="py-24 border-t bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {FAQsTips.map((cat) => (
              <div
                key={cat.title}
                className="p-6 rounded-2xl border bg-white hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="text-3xl mb-4">{cat.icon}</div>
                <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {cat.count} articles
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Our support team is available 24/7 to help you with any issues or
            questions you might have.
          </p>
          <button className="h-14 px-10 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Contact Support
          </button>
        </div>
      </section>
    </>
  );
}
