"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeClosed, Loader2Icon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPassword, setSetIsPassword] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [params] = useQueryStates(searchParamsSchema);
  const { redirect } = params;

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await signIn.email({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError(error?.message || "Invalid credentials");
      return;
    }

    toast.success("Login successful");
    router.push(redirect ?? "/dashboard");
    router.refresh();
    setIsLoading(false);
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email to sign in to your account"
      footerText="Don't have an account?"
      footerLink="/sign-up"
      footerLinkText="Sign up"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            value={formData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            disabled={isLoading && !error}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href={`/reset-password${
                redirect !== null ? `?redirect=${redirect}` : ""
              }`}
              className="text-primary text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={isPassword ? "password" : "text"}
              value={formData.password}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              required
              disabled={isLoading && !error}
              className="pr-6"
            />
            <button
              type="button"
              className="absolute right-4 self-center"
              onClick={() => setSetIsPassword((prev) => !prev)}
            >
              {isPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeClosed className="size-5" />
              )}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading && !error}>
          {isLoading && !error ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
