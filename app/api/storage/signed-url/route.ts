import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/lib/files";

// POST /api/storage/signed-url - Generate a signed URL for file access
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { key } = body;

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  // TODO: Implement proper ownership check by looking up the file in DB
  // For now, we rely on the fact that only authorized users can see the file key/url in the first place

  try {
    const url = await getSignedDownloadUrl(key);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to generate signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate URL" },
      { status: 500 },
    );
  }
}
