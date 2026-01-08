"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ResendEmailComponent } from "@/components/auth/resend-email-component";
import axios from "axios";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { error, loading, setError, setLoading } = useAppStore();
  const { token } = useParams();

  useEffect(() => {
    setError("");
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post<{ message: string }>(
        "/api/auth/custom/verify-email/token",
        {
          token,
        }
      );
      toast.success(result.data.message);
      router.push("/log-in");
    } catch (error: Error | any) {
      if (error.response.data) {
        toast.error(error.response.data.message);
        setError(error.response.data.message);
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
              Click the button below to proceed and verify your email.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2Icon className="animate-spin" /> : "Proceed"}
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
