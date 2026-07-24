import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

  try {
    const objectKey = typeof key === "string" && key.includes("/f/") ? key.split("/f/")[1] : key;
    const [workspaceFile, legacyAsset] = await Promise.all([
      db.workspaceFile.findFirst({ where: { objectKey, organization: { members: { some: { userId: session.user.id } } }, status: "ACTIVE" } }),
      db.ideaInput.findFirst({ where: { fileUrl: { contains: objectKey }, idea: { userId: session.user.id } } }),
    ]);
    if (!workspaceFile && !legacyAsset) return NextResponse.json({ error: "File not found" }, { status: 404 });
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
