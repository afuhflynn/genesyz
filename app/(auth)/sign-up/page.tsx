"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeClosed, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPassword, setSetIsPassword] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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

    const { error } = await signUp.email({
      name: formData.name,
      password: formData.password,
      email: formData.email,
    });

    if (error) {
      setError(error?.message || "Registration failed");
      return;
    }

    // call he send verification email endpoint
    const result = await axios.post("/api/auth/send-verification-on-register", {
      email: formData.email,
    });

    if (result.data?.error) {
      setError(result.data.error || "Failed to send verification email");
      setIsLoading(false);
      return;
    }

    // Redirect to login after successful registration
    toast.success("Registration successful");
    router.push("/verify-email?email=" + encodeURIComponent(formData.email));
    router.refresh();

    setIsLoading(false);
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email below to create your account"
      footerText="Already have an account?"
      footerLink="/sign-in"
      footerLinkText="Sign in"
      showMagicLink={false}
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            required
            disabled={isLoading && !error}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            required
            disabled={isLoading && !error}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
