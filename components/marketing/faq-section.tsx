"use client";

import { motion } from "framer-motion";
import { useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/constants";
import { searchParamsSchema } from "@/nuqs";

interface FAQ {
  question: string;
  answer: string;
}
export function FAQSection() {
  const [params] = useQueryStates(searchParamsSchema);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    if (
      params.search?.trim() !== "" &&
      params.search !== undefined &&
      params.search !== null
    ) {
      setFilteredFaqs(
        faqs.filter(
          (f) =>
            f.question
              .toLowerCase()
              .includes(params.search?.toLowerCase() as string) ||
            f.answer
              .toLowerCase()
              .includes(params.search?.toLowerCase() as string),
        ),
      );
    } else {
      setFilteredFaqs(faqs);
    }
  }, [params.search]);
  return (
    <section id="faq" className="py-24 bg-slate-50/50 dark:bg-transparent">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Genesyz.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
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
