import { NextResponse } from "next/server";
import { GROWTH_CHANNELS } from "@/lib/growth/constants";

export async function GET() {
  return NextResponse.json({
    data: GROWTH_CHANNELS.map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
    })),
  });
}
