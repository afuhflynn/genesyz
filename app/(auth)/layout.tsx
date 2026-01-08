import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | IdeasVault",
  description:
    "IdeasVault auth. Create, signin into your account, update password and more.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
