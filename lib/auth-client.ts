import { polarClient } from "@polar-sh/better-auth/client";
import { magicLinkClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, owner, admin, member, viewer } from "@/lib/auth/access";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    polarClient(),
    magicLinkClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
        viewer,
      },
    }),
    twoFactorClient(),
  ],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
