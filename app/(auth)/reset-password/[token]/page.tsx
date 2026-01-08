"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeClosed, Loader2Icon } from "lucide-react";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isPassword, setIsPassword] = useState(true);

  const { token } = useParams();
  const router = useRouter();
  const { error, loading, setError, setLoading } = useAppStore();

  useEffect(() => {
    setError("");
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      toast.error("Please both passwords must match. Check your passwords.");
      setError("Please both passwords must match. Check your passwords.");
      return;
    }
    setLoading(true);
    try {
      await axios.put<{ message: string }>("/api/auth/custom/reset-password", {
        password: formData.password,
        token,
      });
      toast.success(
        "Your password has been reset. You can now log in with your new password."
      );
      router.push("/log-in");
    } catch (error: Error | any) {
      if (error.response.data) {
        toast.error(error.response.data.message);
        setError(error.response.data.message);
      } else {
        toast.error("Sorry, an unexpected error occurred. Try again later.");
        setError("Sorry, an unexpected error occurred. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleTogglePassword = () => {
    setIsPassword((prev) => (prev ? false : true));

    setTimeout(() => {
      setIsPassword(true);
    }, 10000);
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
              Reset your password
            </CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPassword ? "password" : "text"}
                    name="password"
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    className="pr-10"
                    required
                  />
                  <button
                    className="absolute right-2 top-0 bottom-0"
                    type="button"
                    onClick={handleTogglePassword}
                  >
                    {isPassword ? (
                      <Eye className="w-[1.3rem] h-[1.3rem]" />
                    ) : (
                      <EyeClosed className="w-[1.3rem] h-[1.3rem]" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading || !formData.confirmPassword || !formData.password
                }
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Reset Password"
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
