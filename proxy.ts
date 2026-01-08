import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";
import { createMiddleware } from "@arcjet/next";
import arcjet, { detectBot, shield } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:VERCEL"],
    }),
  ],
});

const protectedRoutes = [
  "/dashboard",
  "/ideas",
  "/profile",
  "/billing",
  "/admin",
];

const unprotectedAuthRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isUnprotectedAuthRoutes = unprotectedAuthRoutes.some((r) =>
    pathname.startsWith(r)
  );

  // 1. If not signed in → block protected routes
  if (!sessionCookie && isProtected) {
    const { searchParams } = new URL(request.url);
    const loginUrl = new URL("/sign-in", request.url);

    loginUrl.searchParams.set(
      "redirect",
      encodeURIComponent(
        `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`
      )
    );
    return NextResponse.redirect(loginUrl);
  }

  // 2. If signed in → block auth routes only (not everything else)
  if (sessionCookie && isUnprotectedAuthRoutes) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. handle root route visit after successful sign in
  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default createMiddleware(aj, proxy);
