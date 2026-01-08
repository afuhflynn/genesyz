"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const { error, loading, setError, setLoading } = useAppStore();

  useEffect(() => {
    setError("");
  }, [setError]);

  const resendVerificationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await axios.put<{ message: string }>(
        "/api/auth/custom/resend-verification-email",
        {
          email,
        }
      );
      toast.success(result.data.message);
      router.push("/verify-email");
    } catch (error: Error | any) {
      if (error.response.data) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setError("Sorry, an unexpected error occurred. Try again later.");
        toast.error("Sorry, an unexpected error occurred. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Resend verification email
            </CardTitle>
            <CardDescription>
              Enter your email below to get a new verification email.
            </CardDescription>
          </CardHeader>
          <form onSubmit={resendVerificationEmail}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="verification-code"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Resend Email"
                )}
              </Button>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
