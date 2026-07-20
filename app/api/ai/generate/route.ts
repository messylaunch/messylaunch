import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generateOutline } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "admin only" }, { status: 403 });
  try {
    const { kind, prompt, useExisting } = await req.json();
    if (kind !== "COURSE" && kind !== "PROJECT") {
      return NextResponse.json({ error: "kind must be COURSE or PROJECT" }, { status: 400 });
    }
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    const outline = await generateOutline({ kind, prompt, useExisting: Boolean(useExisting) });
    return NextResponse.json({ outline, live: Boolean(process.env.ANTHROPIC_API_KEY) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "generation failed" }, { status: 500 });
  }
}
