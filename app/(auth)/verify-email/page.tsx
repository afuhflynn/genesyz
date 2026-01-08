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
import { ResendEmailComponent } from "@/components/auth/resend-email-component";
import { Loader2Icon } from "lucide-react";

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const { error, loading, setError, setLoading } = useAppStore();

  useEffect(() => {
    setError("");
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await axios.post<{ message: string }>(
        "/api/auth/custom/verify-email",
        {
          code: verificationCode,
        }
      );
      toast.success(result.data.message);
      router.push("/log-in");
    } catch (error: Error | any) {
      if (error.response.data) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
        toast.error(error.message);
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
              Verify your email
            </CardTitle>
            <CardDescription>
              We've sent a 6 digit verification code to your email. Please enter
              the code below.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="number"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !verificationCode}
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Verify Email"
                )}
              </Button>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
            </CardContent>
          </form>
          <ResendEmailComponent loading={loading as boolean} />
        </Card>
      </motion.div>
    </div>
  );
}
