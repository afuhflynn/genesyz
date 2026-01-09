import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { utapi } from "@/lib/uploadthing-server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const assetId = params.id;

  try {
    const asset = await db.ideaInput.findUnique({
      where: { id: assetId },
      include: { idea: true },
    });

    if (!asset) {
      return new NextResponse("Asset not found", { status: 404 });
    }

    if (asset.idea.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete from UploadThing if it has a fileUrl
    if (asset.fileUrl) {
      // Extract file key from URL: https://utfs.io/f/<fileKey>
      const fileKey = asset.fileUrl.split("/f/")[1];
      if (fileKey) {
        await utapi.deleteFiles(fileKey);
      }
    }

    // Delete from database
    await db.ideaInput.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
