import { NextResponse } from "next/server";
import { getHostedProjectBySlug } from "@/lib/hosting";

const securityHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": [
    "sandbox allow-scripts allow-forms allow-popups allow-modals",
    "default-src 'self' https: data: blob:",
    "img-src 'self' https: data: blob:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' https: data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self' https:",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

function unavailablePage(message: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Hosted prototype unavailable</title></head><body><main style="font-family:system-ui;max-width:42rem;margin:12vh auto;padding:2rem;text-align:center"><h1>Prototype unavailable</h1><p>${message}</p></main></body></html>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = await getHostedProjectBySlug(slug);

  if (!project?.activeRelease?.html) {
    return new NextResponse(unavailablePage("This hosted prototype is not currently published."), {
      status: 404,
      headers: securityHeaders,
    });
  }

  return new NextResponse(project.activeRelease.html, {
    status: 200,
    headers: {
      ...securityHeaders,
      ETag: `W/\"${project.activeRelease.id}\"`,
    },
  });
}
