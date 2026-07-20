import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { bunnyConfigured, createVideo } from "@/lib/bunny";

// Registers a video in your Bunny Stream library and returns the upload target.
// The browser then PUTs the file bytes to uploadUrl with your AccessKey header
// (or use Bunny's TUS endpoint for large/resumable uploads).
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "admin only" }, { status: 403 });
  if (!bunnyConfigured()) {
    return NextResponse.json(
      { error: "Bunny.net is not configured. Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY in .env." },
      { status: 501 }
    );
  }
  const { title } = await req.json();
  const video = await createVideo(title ?? "Untitled lesson");
  return NextResponse.json(video);
}
