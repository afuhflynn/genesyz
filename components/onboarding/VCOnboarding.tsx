"use client";

import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LocationSelector } from "@/components/location";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "system" | "user";
  content: string;
  type?: "text" | "input" | "location" | "complete";
}

interface OnboardingData {
  founderName: string;
  founderRole: string;
  experienceLevel: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  targetLocation: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    isGlobal?: boolean;
  } | null;
  traction: string;
  teamSize: string;
  timeline: string;
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "system",
  content:
    "Welcome! I'm your IdeasVault assistant. I'll help you capture and validate your startup idea through a quick conversation. Let's start with your name.",
  type: "text",
};

const STEPS = [
  {
    id: "name",
    question: "What's your name?",
    field: "founderName" as const,
    validate: (val: string) => val.length >= 2,
  },
  {
    id: "role",
    question: "What's your role? (e.g., Founder, Product Manager, Developer)",
    field: "founderRole" as const,
    validate: (val: string) => val.length >= 2,
  },
  {
    id: "experience",
    question: "How would you describe your experience level?",
    field: "experienceLevel" as const,
    validate: (val: string) =>
      ["first-time", "some", "experienced", "serial"].includes(
        val.toLowerCase(),
      ),
  },
  {
    id: "problem",
    question:
      "What problem are you solving? Describe the pain point your customers face.",
    field: "problem" as const,
    validate: (val: string) => val.length >= 10,
  },
  {
    id: "solution",
    question:
      "How does your solution work? Explain what you're building to solve this problem.",
    field: "solution" as const,
    validate: (val: string) => val.length >= 10,
  },
  {
    id: "customer",
    question:
      "Who is your target customer? Be specific about who would use this.",
    field: "targetCustomer" as const,
    validate: (val: string) => val.length >= 5,
  },
  {
    id: "location",
    question: "Where do you plan to launch this? Select your target market.",
    field: "targetLocation" as const,
    type: "location",
    validate: (val: any) => val !== null,
  },
  {
    id: "traction",
    question:
      "Do you have any traction so far? (users, revenue, waitlist, none yet)",
    field: "traction" as const,
    validate: () => true,
  },
  {
    id: "team",
    question:
      "What's your current team size? (just you, 2-3 people, larger team)",
    field: "teamSize" as const,
    validate: () => true,
  },
  {
    id: "timeline",
    question: "What's your target timeline to launch? (weeks, months)",
    field: "timeline" as const,
    validate: () => true,
  },
];

const EXPERIENCE_OPTIONS = [
  {
    value: "first-time",
    label: "First-time founder",
    description: "This is my first startup",
  },
  {
    value: "some",
    label: "Some experience",
    description: "I've worked on startups before",
  },
  {
    value: "experienced",
    label: "Experienced",
    description: "I've launched products before",
  },
  {
    value: "serial",
    label: "Serial founder",
    description: "I've built multiple startups",
  },
];

const TRACTION_OPTIONS = [
  {
    value: "none",
    label: "No traction yet",
    description: "Just an idea at this stage",
  },
  {
    value: "validation",
    label: "Problem validation",
    description: "Talked to potential customers",
  },
  {
    value: "waitlist",
    label: "Waitlist",
    description: "People signed up to try it",
  },
  { value: "users", label: "Active users", description: "People are using it" },
  {
    value: "revenue",
    label: "Revenue",
    description: "Already generating revenue",
  },
];

export function VCOnboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [data, setData] = useState<OnboardingData>({
    founderName: "",
    founderRole: "",
    experienceLevel: "",
    problem: "",
    solution: "",
    targetCustomer: "",
    targetLocation: null,
    traction: "",
    teamSize: "",
    timeline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentStepData = STEPS[currentStep];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleTextSubmit = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update data
    setData((prev) => ({
      ...prev,
      [currentStepData.field]: input,
    }));

    setInput("");

    // Move to next step
    await proceedToNextStep();
  };

  const handleLocationSelect = async (
    location: OnboardingData["targetLocation"],
  ) => {
    const locationName = location?.isGlobal
      ? "Global"
      : location?.city
        ? `${location.city}, ${location.country}`
        : location?.country;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: locationName || "Global",
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);

    setData((prev) => ({
      ...prev,
      targetLocation: location,
    }));

    await proceedToNextStep();
  };

  const handleOptionSelect = async (value: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);

    setData((prev) => ({
      ...prev,
      [currentStepData.field]: value,
    }));

    await proceedToNextStep();
  };

  const proceedToNextStep = async () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = STEPS[currentStep + 1];

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: nextStep.question,
            type: nextStep.type === "location" ? "location" : "text",
          },
        ]);
        setCurrentStep(currentStep + 1);
      }, 500);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setIsComplete(true);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content:
              "Perfect! Your idea has been captured. I'm now running AI research to validate it. You'll receive an email when the analysis is complete.",
            type: "complete",
          },
        ]);

        // Redirect after delay
        setTimeout(() => {
          router.push(`/ideas/${result.ideaId}`);
        }, 3000);
      } else {
        throw new Error("Failed to create idea");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content:
            "I apologize, but there was an error saving your idea. Please try again or contact support.",
          type: "text",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const getStepIcon = (index: number) => {
    if (index === 0) return <User className="h-4 w-4" />;
    if (index === 1) return <Building2 className="h-4 w-4" />;
    if (index === 2) return <Sparkles className="h-4 w-4" />;
    if (index <= 4) return <Target className="h-4 w-4" />;
    if (index === 5) return <Users className="h-4 w-4" />;
    if (index === 6) return <TrendingUp className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="max-w-2xl mx-auto h-[600px] flex flex-col">
      {/* Progress Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    getStepIcon(index)
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isSubmitting && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Creating your idea...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        {!isComplete && !isSubmitting && (
          <CardContent className="border-t p-4">
            {currentStepData.type === "location" ? (
              <LocationSelector
                value={data.targetLocation}
                onChange={handleLocationSelect}
              />
            ) : currentStepData.id === "experience" ? (
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className="p-3 text-left border rounded-lg hover:bg-accent hover:border-accent transition-colors"
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            ) : currentStepData.id === "traction" ? (
              <div className="space-y-2">
                {TRACTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:border-accent transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={!input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        )}

        {isComplete && (
          <CardContent className="border-t p-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Redirecting to your idea...
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
