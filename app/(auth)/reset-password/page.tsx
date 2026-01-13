"use client";

import { motion } from "framer-motion";
import { Eye, EyeClosed, Loader2Icon, LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks";
import { searchParamsSchema } from "@/nuqs";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isPassword, setIsPassword] = useState(true);
  const [params] = useQueryStates(searchParamsSchema);

  const router = useRouter();
  const resetPassword = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPassword.mutate(
      {
        password: formData.password,
        token: params.token as string,
      },
      {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    );
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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
              <LockIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black">
              Reset password
            </CardTitle>
            <CardDescription className="text-base">
              Enter your new password below to regain access to your account.
            </CardDescription>
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
                    placeholder="••••••••"
                    className="h-12 rounded-xl pr-12"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange(e.target.name, e.target.value)
                    }
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                    onClick={() => setIsPassword(!isPassword)}
                  >
                    {isPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeClosed className="w-5 h-5" />
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
                  placeholder="••••••••"
                  className="h-12 rounded-xl"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold rounded-xl"
                disabled={
                  resetPassword.isPending ||
                  !formData.confirmPassword ||
                  !formData.password
                }
              >
                {resetPassword.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
