"use client";

import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { useState } from "react";
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
import { PLANS } from "@/lib/polar/client";

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const [createCheckout, setCreateCheckout] = useState(false);
  const [cancelSubscription, _setCancelSubscription] = useState(false);

  // Determine current plan
  // Note: The API returns { subscription: unknown, usage: ... }
  // We need to infer the plan from the subscription object or usage
  // For now, let's assume the API returns a 'plan' field in the subscription object or we can infer from maxIdeas
  const currentPlanId =
    subscription?.usage.maxIdeas === Infinity ? "PRO" : "FREE";

  const handleUpgrade = async (planId: string) => {
    let productId = "";

    if (planId === "pro") {
      productId = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID as string;
    } else {
      productId = process.env.NEXT_PUBLIC_POLAR_FREE_PRODUCT_ID as string;
    }
    setCreateCheckout(true);
    try {
      await authClient.checkout({
        products: [productId],
        successUrl: "/dashboard?checkout_id={CHECKOUT_ID}",
        slug: planId,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setCreateCheckout(false);
    }
  };

  const handleCancel = async () => {
    if (
      confirm(
        "Are you sure you want to cancel? You will lose access to Pro features at the end of your billing period.",
      )
    ) {
      // await authClient.customer.subscriptions.
      // cancelSubscription.mutate();
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
            <p className="text-xs text-muted-foreground pt-1">
              {currentPlanId === "FREE"
                ? "Upgrade to Pro for unlimited ideas."
                : "You have unlimited active ideas."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <Card
          className={currentPlanId === "FREE" ? "border-primary shadow-md" : ""}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{PLANS.FREE.name}</CardTitle>
                <CardDescription>Perfect for hobbyists</CardDescription>
              </div>
              {currentPlanId === "FREE" && <Badge>Current Plan</Badge>}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {PLANS.FREE.features.map((feature, i) => (
                <li key={`item-${i}`} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlanId === "FREE" ? (
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelSubscription}
              >
                {cancelSubscription ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Downgrade to Free
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card
          className={currentPlanId === "PRO" ? "border-primary shadow-md" : ""}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{PLANS.PRO.name}</CardTitle>
                <CardDescription>For serious founders</CardDescription>
              </div>
              {currentPlanId === "PRO" && <Badge>Current Plan</Badge>}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold">{PLANS.PRO.price}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {PLANS.PRO.features.map((feature, i) => (
                <li key={`item-${i}`} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlanId === "PRO" ? (
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => handleUpgrade("pro")}
                disabled={createCheckout}
              >
                {createCheckout ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Upgrade to Pro
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {currentPlanId === "PRO" && (
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
