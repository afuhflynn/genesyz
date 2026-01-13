"use client";

import { motion } from "framer-motion";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVerifyEmail } from "@/hooks";

export default function VerifyEmailTokenPage() {
  const router = useRouter();
  const { token } = useParams();
  const verifyEmail = useVerifyEmail();

  const handleVerify = () => {
    if (token) {
      verifyEmail.mutate(token as string, {
        onSuccess: () => {
          router.push("/sign-in");
        },
      });
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
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2Icon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black">
              Verify your email
            </CardTitle>
            <CardDescription className="text-base">
              Click the button below to complete your registration and activate
              your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleVerify}
              className="w-full h-12 text-lg font-bold rounded-xl"
              disabled={verifyEmail.isPending}
            >
              {verifyEmail.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Verify Email"
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
