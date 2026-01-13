"use client";

import { Loader2Icon, MailIcon } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMagicLink } from "@/hooks";

export default function MagicLinkPage() {
  const [email, setEmail] = useState("");
  const magicLink = useMagicLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      magicLink.mutate(email, {
        onSuccess: () => {
          setEmail("");
        },
      });
    }
  };

  return (
    <AuthLayout
      title="Magic Link"
      description="Enter your email to receive a passwordless sign-in link."
      footerText="Remembered your password?"
      footerLink="/sign-in"
      footerLinkText="Sign In"
      showMagicLink={false}
      isLoading={magicLink.isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-12 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold rounded-xl"
          disabled={magicLink.isPending || !email}
        >
          {magicLink.isPending ? (
            <Loader2Icon className="animate-spin mr-2" />
          ) : (
            <MailIcon className="mr-2 h-5 w-5" />
          )}
          Send Magic Link
        </Button>
      </form>
    </AuthLayout>
  );
}
