"use client";

import { useState } from "react";
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
import { useResendVerification } from "@/hooks";
import { Loader2Icon, MailIcon } from "lucide-react";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const resendVerification = useResendVerification();

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    resendVerification.mutate(email, {
      onSuccess: () => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      },
    });
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
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MailIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black">
              Resend verification
            </CardTitle>
            <CardDescription className="text-base">
              Enter your email below and we'll send you a new verification code.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResend}>
            <CardContent className="space-y-4">
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
                disabled={resendVerification.isPending || !email}
              >
                {resendVerification.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Send Verification Email"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
