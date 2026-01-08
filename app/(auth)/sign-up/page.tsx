"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed, Loader2Icon } from "lucide-react";
import { useSignUp } from "@/hooks";

export default function RegisterPage() {
  const [isPassword, setIsPassword] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const signUp = useSignUp();

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    signUp.mutate({
      name: formData.name,
      password: formData.password,
      email: formData.email,
      callbackURL: "/dashboard",
    });
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email below to create your account"
      footerText="Already have an account?"
      footerLink="/sign-in"
      footerLinkText="Sign in"
      isLoading={signUp.isPending}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            className="h-12 rounded-xl"
            value={formData.name}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            required
            disabled={signUp.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="h-12 rounded-xl"
            value={formData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            required
            disabled={signUp.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
              disabled={signUp.isPending}
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
          disabled={signUp.isPending}
        >
          {signUp.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
