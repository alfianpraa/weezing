import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { parseBlob } from "music-metadata";
import { AUDIO_DIR, COVER_DIR, MEDIA_URL_PREFIX } from "./songStore";

export const MAX_AUDIO_BYTES = 30 * 1024 * 1024; // 30MB
export const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadValidationError extends Error {}

function extFromName(name: string, fallback: string): string {
  const ext = path.extname(name);
  return ext ? ext : fallback;
}

export function validateAudioFile(audio: unknown): asserts audio is File {
  if (!(audio instanceof File) || audio.size === 0) {
    throw new UploadValidationError("File audio wajib diisi.");
  }
  if (!audio.type.startsWith("audio/")) {
    throw new UploadValidationError("File yang diupload harus berupa audio.");
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new UploadValidationError("File audio maksimal 30MB.");
  }
}

export function validateCoverFile(cover: unknown): asserts cover is File {
  if (!(cover instanceof File)) return;
  if (!cover.type.startsWith("image/")) {
    throw new UploadValidationError("Cover harus berupa file gambar.");
  }
  if (cover.size > MAX_COVER_BYTES) {
    throw new UploadValidationError("Cover maksimal 5MB.");
  }
}

export async function saveAudioFile(audio: File): Promise<{ url: string; duration: number }> {
  let duration = 0;
  try {
    const metadata = await parseBlob(audio);
    duration = Math.round(metadata.format.duration ?? 0);
  } catch {
    duration = 0;
  }

  const id = crypto.randomUUID();
  const fileName = `${id}${extFromName(audio.name, ".mp3")}`;
  const buffer = Buffer.from(await audio.arrayBuffer());
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  await fs.writeFile(path.join(AUDIO_DIR, fileName), buffer);

  return { url: `${MEDIA_URL_PREFIX}/audio/${fileName}`, duration };
}

export async function saveCoverFile(cover: File): Promise<string> {
  const id = crypto.randomUUID();
  const fileName = `${id}${extFromName(cover.name, ".jpg")}`;
  const buffer = Buffer.from(await cover.arrayBuffer());
  await fs.mkdir(COVER_DIR, { recursive: true });
  await fs.writeFile(path.join(COVER_DIR, fileName), buffer);

  return `${MEDIA_URL_PREFIX}/covers/${fileName}`;
}
