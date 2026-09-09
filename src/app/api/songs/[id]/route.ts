import { NextResponse } from "next/server";
import { deleteSong } from "@/lib/songStore";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteSong(id);
  if (!removed) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
