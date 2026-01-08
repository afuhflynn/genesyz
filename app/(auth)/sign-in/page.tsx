"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed, Loader2Icon, LockIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";
import Link from "next/link";
import { useSignIn } from "@/hooks";

export default function LoginPage() {
  const [isPassword, setIsPassword] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [params] = useQueryStates(searchParamsSchema);
  const { redirect } = params;
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
      callbackURL: redirect ?? "/dashboard",
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
