"use client";

import { motion } from "framer-motion";
import { Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useResendVerification, useVerifyEmail } from "@/hooks";

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyEmail.mutate(verificationCode, {
      onSuccess: () => {
        router.push("/sign-in");
      },
    });
  };

  const handleResend = () => {
    if (email) {
      resendVerification.mutate(email);
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
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-black">
              Verify your email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent a 6-digit code to{" "}
              <span className="font-bold text-foreground">{email}</span>. Enter
              it below to activate your account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col items-center space-y-8">
              <div className="space-y-2">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="h-12 w-12 text-xl font-bold rounded-xl border"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-12 w-12 text-xl font-bold rounded-xl border"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-12 w-12 text-xl font-bold rounded-xl border"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-12 w-12 text-xl font-bold rounded-xl border"
                    />
                    <InputOTPSlot
                      index={4}
                      className="h-12 w-12 text-xl font-bold rounded-xl border-2"
                    />
                    <InputOTPSlot
                      index={5}
                      className="h-12 w-12 text-xl font-bold rounded-xl border-2"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold rounded-xl"
                disabled={
                  verifyEmail.isPending || verificationCode.length !== 6
                }
              >
                {verifyEmail.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Verify Account"
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="font-bold text-primary hover:text-primary/80"
                  onClick={handleResend}
                  disabled={resendVerification.isPending}
                >
                  {resendVerification.isPending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
