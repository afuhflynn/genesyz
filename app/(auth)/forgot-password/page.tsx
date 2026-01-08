"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { error, loading, setError, setLoading } = useAppStore();
  useEffect(() => {
    setError("");
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post<{ message: string }>(
        "/api/auth/custom/forgot-password",
        {
          email,
        }
      );
      toast.success("Check your email for password reset instructions.");
      setEmail("");
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
              Forgot password
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                  "Send reset link"
                )}
              </Button>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
            </CardContent>
          </form>
          <CardFooter>
            <Link
              href="/log-in"
              className="text-sm text-muted-foreground hover:text-primary flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
