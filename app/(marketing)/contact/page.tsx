"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate sending - in production, this would hit an API route
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or want to discuss a custom plan?
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-foreground"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </motion.form>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-2xl border bg-white">
                <h3 className="font-bold mb-4">Other ways to reach us</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:support@genesyz.ai"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span>support@genesyz.ai</span>
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl border bg-white">
                <h3 className="font-bold mb-2">Response time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
