import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { addSong, readSongs } from "@/lib/songStore";
import { DEFAULT_COVER } from "@/lib/constants";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  UploadValidationError,
  saveAudioFile,
  saveCoverFile,
  validateAudioFile,
  validateCoverFile,
} from "@/lib/mediaUpload";
import type { SongRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const songs = await readSongs();
  const sorted = [...songs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ songs: sorted });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData();

  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();
  const albumInput = String(form.get("album") ?? "").trim();
  const audio = form.get("audio");
  const cover = form.get("cover");

  if (!title || !artist) {
    return NextResponse.json({ error: "Judul dan artis wajib diisi." }, { status: 400 });
  }

  try {
    validateAudioFile(audio);
    validateCoverFile(cover);
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const { url: audioUrl, duration } = await saveAudioFile(audio);
  const coverUrl = cover instanceof File && cover.size > 0 ? await saveCoverFile(cover) : DEFAULT_COVER;

  const song: SongRecord = {
    id: crypto.randomUUID(),
    title,
    artist,
    album: albumInput || title,
    cover: coverUrl,
    duration,
    audioUrl,
    createdAt: new Date().toISOString(),
  };

  await addSong(song);

  return NextResponse.json({ song }, { status: 201 });
}
