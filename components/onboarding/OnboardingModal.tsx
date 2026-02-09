"use client";

import { ChevronRight, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCompleteOnboarding,
  useOnboardingStatus,
} from "@/hooks/useAnalytics";

export function OnboardingModal() {
  const router = useRouter();
  const { data: status, isLoading } = useOnboardingStatus();
  const completeOnboarding = useCompleteOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (status?.showOnboarding && !isLoading) {
      setIsOpen(true);
    }
  }, [status, isLoading]);

  const handleStartOnboarding = () => {
    setIsOpen(false);
    router.push("/onboarding");
  };

  const handleSkip = () => {
    setIsOpen(false);
    router.push("/ideas/new");
  };

  if (!isOpen || isLoading || !status?.showOnboarding) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-black/50 cursor-default"
        onClick={handleSkip}
        onKeyDown={(e) => e.key === "Escape" && handleSkip()}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 shadow-2xl">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Welcome to IdeasVault!</h2>
          <p className="text-muted-foreground mb-8">
            Let's quickly capture your startup idea through a guided
            conversation. Our AI will analyze it and provide actionable
            insights.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleStartOnboarding}
              className="w-full h-12 text-base"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Guided Onboarding
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full h-12 text-base"
            >
              Skip to Quick Entry
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Takes about 2-3 minutes • No credit card required
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
