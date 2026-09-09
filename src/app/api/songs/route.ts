import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { parseBlob } from "music-metadata";
import { addSong, readSongs, AUDIO_DIR, COVER_DIR } from "@/lib/songStore";
import { DEFAULT_COVER } from "@/lib/constants";
import type { SongRecord } from "@/lib/types";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 30 * 1024 * 1024; // 30MB
const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5MB

function extFromName(name: string, fallback: string): string {
  const ext = path.extname(name);
  return ext ? ext : fallback;
}

export async function GET() {
  const songs = await readSongs();
  const sorted = [...songs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ songs: sorted });
}

export async function POST(request: Request) {
  const form = await request.formData();

  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();
  const albumInput = String(form.get("album") ?? "").trim();
  const audio = form.get("audio");
  const cover = form.get("cover");

  if (!title || !artist) {
    return NextResponse.json({ error: "Title and artist are required." }, { status: 400 });
  }
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "An audio file is required." }, { status: 400 });
  }
  if (!audio.type.startsWith("audio/")) {
    return NextResponse.json({ error: "The uploaded file must be an audio file." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Audio file must be 30MB or smaller." }, { status: 400 });
  }
  if (cover instanceof File && cover.size > 0) {
    if (!cover.type.startsWith("image/")) {
      return NextResponse.json({ error: "Cover must be an image file." }, { status: 400 });
    }
    if (cover.size > MAX_COVER_BYTES) {
      return NextResponse.json({ error: "Cover image must be 5MB or smaller." }, { status: 400 });
    }
  }

  const id = crypto.randomUUID();

  let duration = 0;
  try {
    const metadata = await parseBlob(audio);
    duration = Math.round(metadata.format.duration ?? 0);
  } catch {
    duration = 0;
  }

  const audioExt = extFromName(audio.name, ".mp3");
  const audioFileName = `${id}${audioExt}`;
  const audioBuffer = Buffer.from(await audio.arrayBuffer());
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  await fs.writeFile(path.join(AUDIO_DIR, audioFileName), audioBuffer);
  const audioUrl = `/uploads/audio/${audioFileName}`;

  let coverUrl = DEFAULT_COVER;
  if (cover instanceof File && cover.size > 0) {
    const coverExt = extFromName(cover.name, ".jpg");
    const coverFileName = `${id}${coverExt}`;
    const coverBuffer = Buffer.from(await cover.arrayBuffer());
    await fs.mkdir(COVER_DIR, { recursive: true });
    await fs.writeFile(path.join(COVER_DIR, coverFileName), coverBuffer);
    coverUrl = `/uploads/covers/${coverFileName}`;
  }

  const song: SongRecord = {
    id,
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
