"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2Icon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(email, {
      onSuccess: () => {
        setEmail("");
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
              Forgot password
            </CardTitle>
            <CardDescription className="text-base">
              Enter your email address and we'll send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
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
                disabled={forgotPassword.isPending || !email}
              >
                {forgotPassword.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="justify-center border-t py-6">
            <Link
              href="/sign-in"
              className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
