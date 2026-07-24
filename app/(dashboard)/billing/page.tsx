"use client";

import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks";
import { authClient } from "@/lib/auth-client";
import { WORKSPACE_PLANS, type WorkspacePlanId } from "@/lib/polar/client";

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const [createCheckout, setCreateCheckout] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  // Determine current plan
  // Note: The API returns { subscription: unknown, usage: ... }
  // We need to infer the plan from the subscription object or usage
  // For now, let's assume the API returns a 'plan' field in the subscription object or we can infer from maxIdeas
  const currentPlanId = (subscription?.subscription ||
    "EXPLORER") as WorkspacePlanId;

  const handleUpgrade = async (planId: WorkspacePlanId) => {
    const plan = WORKSPACE_PLANS[planId];
    if (!plan.polarProductId) return;
    setCreateCheckout(true);
    try {
      await authClient.checkout({
        products: [plan.polarProductId],
        successUrl: "/dashboard?checkout_id={CHECKOUT_ID}",
        slug: planId.toLowerCase(),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setCreateCheckout(false);
    }
  };

  const handleOpenPortal = async () => {
    setOpeningPortal(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Billing portal unavailable");
      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Billing portal unavailable",
      );
    } finally {
      setOpeningPortal(false);
    }
  };

  if (isLoading) {
    return <BillingSkeleton />;
  }

  return (
    <div className="space-y-8 max-w-5xl lg:w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and usage limits.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={handleOpenPortal}
          disabled={openingPortal}
        >
          {openingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Manage billing
        </Button>
      </div>

      {/* Usage Card */}
      <Card className="w-full!">
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>
            Your active ideas usage for this billing period.
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full!">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Active Ideas</span>
              <span className="font-medium">
                {subscription?.usage.activeIdeas} /{" "}
                {subscription?.usage.maxIdeas === 999999
                  ? "Unlimited"
                  : subscription?.usage.maxIdeas}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    ((subscription?.usage.activeIdeas || 0) /
                      (subscription?.usage.maxIdeas === 999999
                        ? 100
                        : subscription?.usage.maxIdeas || 1)) *
                      100,
                  )}%`,
                }}
              />
            </div>
            <div className="grid gap-3 pt-4 text-xs text-muted-foreground sm:grid-cols-2">
              <span>{subscription?.usage.activeStartups} / {subscription?.usage.maxStartups} startups</span>
              <span>{subscription?.usage.seats ?? 0} seats used · {subscription?.usage.pendingInvitations ?? 0} pending</span>
              <span>{subscription?.workspace?.aiCredits ?? 0} AI credits remaining</span>
              <span>{subscription?.workspace?.builderCredits ?? 0} builder generations remaining</span>
              <span>{subscription?.usage.hostedProjects ?? 0} / {subscription?.workspace?.hostedProjectLimit ?? 0} hosted projects</span>
              <span>{formatBytes(subscription?.usage.storageBytes)} / {formatBytes(subscription?.usage.storageLimitBytes)} storage</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Object.values(WORKSPACE_PLANS).map((plan) => (
          <Card
            key={plan.id}
            className={
              currentPlanId === plan.id ? "border-primary shadow-md" : ""
            }
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.seats} seats · {plan.maxStartups} startups
                  </CardDescription>
                </div>
                {currentPlanId === plan.id && <Badge>Current Plan</Badge>}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlanId === plan.id ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : !plan.polarProductId ? (
                <Button className="w-full" variant="outline" asChild>
                  <a href="mailto:hello@genesyz.com">Contact Genesyz</a>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={createCheckout}
                >
                  {createCheckout ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Choose {plan.name}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {currentPlanId !== "EXPLORER" && (
        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 text-sm text-muted-foreground">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p>
            To manage your billing details, payment methods, or view invoices,
            please check your email for the link from our payment provider,
            Polar.
          </p>
        </div>
      )}
    </div>
  );
}

function formatBytes(value?: string) {
  const bytes = Number(value || 0);
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 1 : 0)} ${units[index]}`;
}

function BillingSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl lg:w-4xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-100" />
        <Skeleton className="h-100" />
      </div>
    </div>
  );
}
