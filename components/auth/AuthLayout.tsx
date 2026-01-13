import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { AuthFooter } from "./auth-footer";
import { SocialsAuth } from "./socials-auth";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
  isLoading?: boolean;
  showMagicLink?: boolean;
  magicLinkHref?: string;
}

export function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerLink,
  footerLinkText,
  isLoading,
  showMagicLink = true,
  magicLinkHref = "/magic-link",
}: AuthLayoutProps) {
  return (
    <div className="bg-muted/50 relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Button className="absolute top-4 left-6" variant={"ghost"} asChild>
        <Link href="/">
          <ArrowLeft />
          Back Home
        </Link>
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-8">
          {children}
          <div className="relative flex flex-col justify-center gap-8">
            <div className="relative flex items-center justify-center">
              <Separator />
              <span className="bg-card absolute self-center p-2">
                Or Continue With
              </span>
            </div>
            {/* Social auth components */}
            <SocialsAuth isLoading={isLoading} />

            {/* Login with magic link */}
            {showMagicLink && (
              <>
                <div className="relative flex items-center justify-center">
                  <Separator />
                  <span className="bg-card absolute self-center p-2">Or</span>
                </div>
                <Button variant="outline" asChild disabled={isLoading}>
                  <Link href={magicLinkHref}>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in with Magic Link
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
        <AuthFooter
          footerText={footerText}
          footerLink={footerLink}
          footerLinkText={footerLinkText}
        />
      </Card>
    </div>
  );
}
