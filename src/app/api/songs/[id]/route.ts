import { NextResponse } from "next/server";
import { deleteSong, deleteUploadedFile, getSongById, updateSong } from "@/lib/songStore";
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const removed = await deleteSong(id);
  if (!removed) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getSongById(id);
  if (!existing) {
    return NextResponse.json({ error: "Lagu tidak ditemukan." }, { status: 404 });
  }

  const form = await request.formData();

  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();
  const albumInput = String(form.get("album") ?? "").trim();
  const audio = form.get("audio");
  const cover = form.get("cover");
  const replacesAudio = audio instanceof File && audio.size > 0;
  const replacesCover = cover instanceof File && cover.size > 0;

  if (!title || !artist) {
    return NextResponse.json({ error: "Judul dan artis wajib diisi." }, { status: 400 });
  }

  try {
    if (replacesAudio) validateAudioFile(audio);
    if (replacesCover) validateCoverFile(cover);
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const updates: Partial<Omit<SongRecord, "id">> = {
    title,
    artist,
    album: albumInput || title,
  };

  if (replacesAudio) {
    const { url, duration } = await saveAudioFile(audio);
    await deleteUploadedFile(existing.audioUrl);
    updates.audioUrl = url;
    updates.duration = duration;
  }

  if (replacesCover) {
    const url = await saveCoverFile(cover);
    await deleteUploadedFile(existing.cover);
    updates.cover = url;
  }

  const updated = await updateSong(id, updates);

  return NextResponse.json({ song: updated });
}
