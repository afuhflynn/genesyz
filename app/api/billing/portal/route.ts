import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { polar } from "@/lib/polar/client";
import { getPrimaryOrganizationEntitlement } from "@/lib/polar/workspace-entitlements";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entitlement = await getPrimaryOrganizationEntitlement(session.user.id);
  if (!entitlement?.polarCustomerId) {
    return NextResponse.json(
      { error: "No billing account is connected to this workspace yet." },
      { status: 404 },
    );
  }

  try {
    const customerSession = await polar.customerSessions.create({
      externalCustomerId: session.user.id,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing`,
    });

    return NextResponse.json({ url: customerSession.customerPortalUrl });
  } catch (error) {
    console.error("[BILLING_PORTAL]", error);
    return NextResponse.json(
      { error: "Unable to open the billing portal right now." },
      { status: 502 },
    );
  }
}
