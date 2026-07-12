"use client";

import { AlertCircle, Eye, EyeClosed, Loader2Icon, X } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignIn } from "@/hooks";
import { searchParamsSchema } from "@/nuqs";

const OAUTH_ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  account_not_linked: {
    title: "Account not linked",
    description:
      "This email is already registered with a different sign-in method. Try signing in with your email and password, or use the other provider you originally signed up with.",
  },
  access_denied: {
    title: "Sign-in cancelled",
    description: "You cancelled the Google sign-in. No changes were made.",
  },
  invalid_callback_request: {
    title: "Invalid request",
    description: "Something went wrong with the sign-in request. Please try again.",
  },
  email_not_found: {
    title: "Email required",
    description:
      "Google did not provide an email address. Please try a different sign-in method.",
  },
  signup_disabled: {
    title: "Sign-up disabled",
    description: "New accounts are not currently being accepted.",
  },
};

const DEFAULT_ERROR = {
  title: "Sign-in failed",
  description: "Something went wrong. Please try again.",
};

export default function LoginPage() {
  const [isPassword, setIsPassword] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [params] = useQueryStates(searchParamsSchema);
  const { redirect, error, error_description } = params;
  const signIn = useSignIn();

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    signIn.mutate({
      email: formData.email,
      password: formData.password,
      callbackURL:
        redirect !== null
          ? decodeURIComponent(redirect as string)
          : "/dashboard",
    });
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email to sign in to your account"
      footerText="Don't have an account?"
      footerLink="/sign-up"
      footerLinkText="Sign up"
      isLoading={signIn.isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">
                  {(OAUTH_ERROR_MESSAGES[error] || DEFAULT_ERROR).title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {error_description ||
                    (OAUTH_ERROR_MESSAGES[error] || DEFAULT_ERROR).description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("error");
                  url.searchParams.delete("error_description");
                  window.history.replaceState({}, "", url.toString());
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="h-12 rounded-xl"
            required
            value={formData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            disabled={signIn.isPending}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href={`/forgot-password${
                redirect !== null ? `?redirect=${redirect}` : ""
              }`}
              className="text-primary text-sm font-bold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={isPassword ? "password" : "text"}
              placeholder="••••••••"
              className="h-12 rounded-xl pr-12"
              value={formData.password}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              required
              disabled={signIn.isPending}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsPassword((prev) => !prev)}
            >
              {isPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeClosed className="size-5" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold rounded-xl"
          disabled={signIn.isPending}
        >
          {signIn.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
