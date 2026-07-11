"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "FAQ", href: "/faq" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center lg:mr-14">
            <Image
              src="/icon.png"
              alt="Genesyz Logo"
              width={46}
              height={46}
              className="aspect-square object-contain"
            />

            <span className="text-xl font-semibold">Genesyz</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
