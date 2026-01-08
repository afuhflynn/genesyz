"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does the AI validation process work?",
    answer:
      "IdeasVault uses a multi-agent AI pipeline. When you submit an idea, specialized agents are triggered to perform market research, analyze current trends, and evaluate execution friction. Finally, a synthesis agent combines these findings into a comprehensive report.",
  },
  {
    question: "Is my idea data secure and private?",
    answer:
      "Yes, absolutely. We take data privacy seriously. Your ideas are encrypted and only accessible by you. We do not use your proprietary idea data to train our base AI models.",
  },
  {
    question: "What kind of inputs can I provide?",
    answer:
      "You can provide text descriptions, upload voice memos (which we transcribe), or upload images like napkin sketches or diagrams (which our vision AI analyzes).",
  },
  {
    question: "Can I export my research reports?",
    answer:
      "Yes, Pro users can export their full research synthesis as a professional PDF report to share with co-founders or investors.",
  },
  {
    question: "How accurate is the AI research?",
    answer:
      "While AI provides incredibly fast and broad research, it should be used as a powerful starting point. We recommend using our reports to guide your primary research and customer interviews.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-slate-50/50 dark:bg-transparent">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about IdeasVault.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
