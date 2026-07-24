"use client";

import { useCompletion } from "@ai-sdk/react";
import {
  ArrowLeft,
  Code2,
  Copy,
  Download,
  Eye,
  Laptop,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Split,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const PRESET_TEMPLATES = [
  {
    title: "Modern SaaS Landing Page",
    desc: "A sleek landing page with dark mode, feature grid, testimonials, pricing plans, and newsletter capture.",
    prompt:
      "Create a modern landing page for a SaaS app with a dark glassmorphic hero section, feature list cards, interactive pricing tier toggles (monthly/yearly), testimonials carousel, and email waitlist form.",
  },
  {
    title: "Mobile App Showcase",
    desc: "A bright, high-converting product page featuring a mock mobile app screen, app benefits, and download links.",
    prompt:
      "Design a high-converting mobile app showcase website with vibrant orange/purple gradients, phone layout mockup columns, core product advantages, interactive FAQ accordions, and App Store badges.",
  },
  {
    title: "E-Commerce storefront mockup",
    desc: "An elegant retail layout showing visual product cards, filters, and an interactive shopping cart drawer.",
    prompt:
      "Generate an elegant e-commerce catalog page showing a list of grid items (with ratings and badges), tag sorting pills, and a fully interactive sidebar cart drawer that updates counts when items are added.",
  },
];

export default function BuilderPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [startupId, setStartupId] = useState<string | null>(null);
  const [promptText, setPromptText] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [prototypeId, setPrototypeId] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"split" | "editor" | "preview">(
    "split",
  );
  const [isSaving, setIsSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const didLoadPrototypeRef = useRef(false);

  // Fetch startup metadata to resolve ID
  useEffect(() => {
    async function fetchStartup() {
      try {
        const res = await fetch(`/api/startups/${slug}`);
        const data = await res.json();
        if (data.data?.id) {
          setStartupId(data.data.id);
        }
      } catch (err) {
        console.error("Failed to load startup details", err);
      }
    }
    fetchStartup();
  }, [slug]);

  useEffect(() => {
    if (!startupId || didLoadPrototypeRef.current) return;
    didLoadPrototypeRef.current = true;
    fetch(`/api/startups/${startupId}/builder/prototypes`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const latest = data?.data?.[0];
        if (latest?.html) {
          setHtmlCode(latest.html);
          setPromptText(latest.prompt || "");
          setPrototypeId(latest.id || null);
        }
      })
      .catch(() => undefined);
  }, [startupId]);

  // AI SDK useCompletion
  const { completion, complete, isLoading } = useCompletion({
    api: startupId ? `/api/startups/${startupId}/builder/generate` : "",
    body: {
      currentCode: htmlCode,
    },
    onError: (err) => {
      toast.error(err.message || "Failed to generate code.");
    },
    onFinish: () => {
      toast.success("Generation completed! Click live preview to interact. 🚀");
    },
  });

  // Sync completion stream to our html code state
  useEffect(() => {
    if (completion) {
      // Clean up markdown block wraps if LLM adds them
      let cleaned = completion;
      if (cleaned.includes("```html")) {
        cleaned = cleaned.split("```html")[1].split("```")[0];
      } else if (cleaned.includes("```")) {
        cleaned = cleaned.split("```")[1].split("```")[0];
      }
      setHtmlCode(cleaned.trim());
    }
  }, [completion]);

  // Handle generation trigger
  const handleGenerate = async (promptOverride?: string) => {
    const finalPrompt = promptOverride || promptText;
    if (!finalPrompt.trim()) {
      toast.error("Please enter a description prompt first.");
      return;
    }

    if (promptOverride) {
      setPromptText(promptOverride);
    }

    try {
      await complete(finalPrompt);
    } catch (err) {
      console.error(err);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    toast.success("HTML code copied to clipboard!");
  };

  const handleSavePrototype = async () => {
    if (!startupId || !htmlCode) return;
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/startups/${startupId}/builder/prototypes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: htmlCode, prompt: promptText }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save prototype");
      setPrototypeId(data.data?.id || null);
      toast.success("Prototype saved to this startup");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save prototype",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishPrototype = async () => {
    if (!startupId || !prototypeId) {
      toast.error("Save the prototype before publishing it.");
      return;
    }
    const response = await fetch(`/api/startups/${startupId}/builder/prototypes/${prototypeId}/publish`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Could not publish prototype");
      return;
    }
    setPublishedUrl(data.url || null);
    toast.success("Prototype published");
  };

  // Download HTML file
  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Prototyped index.html downloaded successfully!");
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/startups/${slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Web App Builder
          </h1>
        </div>

        {htmlCode && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSavePrototype}
              disabled={isSaving}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving…" : "Save"}</span>
            </Button>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </Button>
            <Button onClick={handlePublishPrototype} variant="default" size="sm" className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>Publish</span>
            </Button>
            {publishedUrl && (
              <Button asChild variant="outline" size="sm" className="text-xs">
                <a href={publishedUrl} target="_blank" rel="noreferrer">
                  Open hosted site
                </a>
              </Button>
            )}
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Control Panel / Prompt Area */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <Card className="border border-border/80 shadow-sm shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span>AI Page Generator</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Describe your desired layout, color scheme, sections, and client
                logic in natural language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Example: Design a modern waitlist landing page for our delivery startup. Dark theme with neon green accents, visual mockups, and client-side waitlist sign-up simulation."
                className="min-h-[120px] text-xs leading-relaxed bg-background"
              />
              <Button
                onClick={() => handleGenerate()}
                disabled={isLoading || !promptText.trim()}
                className="w-full gap-2 text-xs"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Webpage...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {htmlCode ? "Update Prototype" : "Generate Prototype"}
                    </span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick presets (only show when not loading, or optionally as tabs) */}
          {!htmlCode && (
            <div className="space-y-3 shrink-0">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                Choose a Starter Template
              </h3>
              <div className="space-y-2">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <Card
                    key={tmpl.title}
                    onClick={() => handleGenerate(tmpl.prompt)}
                    className="border border-border/80 hover:border-primary/40 cursor-pointer transition-all hover:bg-muted/10"
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs font-bold">
                        {tmpl.title}
                      </CardTitle>
                      <CardDescription className="text-[10px] leading-relaxed">
                        {tmpl.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {htmlCode && (
            <Card className="border border-border/80 shadow-sm flex-1 min-h-0 flex flex-col">
              <CardHeader className="p-3 pb-2 shrink-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Editor & Code View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex-1 min-h-0 flex flex-col">
                <Textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="font-mono text-[10px] leading-normal flex-1 resize-none bg-muted/20 border-border p-3"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-8 flex flex-col min-h-0 h-full border rounded-xl overflow-hidden bg-background">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Sandboxed IFrame Preview
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant={activeTab === "split" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("split")}
                className="gap-1 text-xs"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Split View</span>
              </Button>
              <Button
                variant={activeTab === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("preview")}
                className="gap-1 text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Preview</span>
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative bg-muted/10">
            {!htmlCode ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-card">
                <Code2 className="w-12 h-12 text-primary/30 mb-3 animate-pulse" />
                <h3 className="text-sm font-semibold">
                  No Prototype Generated Yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Type a prompt on the left or select a template to build a
                  functional landing page mock.
                </p>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                srcDoc={htmlCode}
                title="Prototype Live Render"
                sandbox="allow-scripts allow-popups allow-forms allow-modals"
                className="w-full h-full border-none bg-white"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
