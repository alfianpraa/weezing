import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import type { SongRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SONGS_FILE = path.join(DATA_DIR, "songs.json");

export const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
export const AUDIO_DIR = path.join(UPLOAD_ROOT, "audio");
export const COVER_DIR = path.join(UPLOAD_ROOT, "covers");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  await fs.mkdir(COVER_DIR, { recursive: true });
  try {
    await fs.access(SONGS_FILE);
  } catch {
    await fs.writeFile(SONGS_FILE, "[]", "utf-8");
  }
}

export async function readSongs(): Promise<SongRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SONGS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSongs(songs: SongRecord[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(SONGS_FILE, JSON.stringify(songs, null, 2), "utf-8");
}

export async function addSong(song: SongRecord): Promise<void> {
  const songs = await readSongs();
  songs.push(song);
  await writeSongs(songs);
}

export async function deleteSong(id: string): Promise<SongRecord | null> {
  const songs = await readSongs();
  const index = songs.findIndex((s) => s.id === id);
  if (index === -1) return null;
  const [removed] = songs.splice(index, 1);
  await writeSongs(songs);

  for (const filePath of [removed.audioUrl, removed.cover]) {
    if (!filePath.startsWith("/uploads/")) continue;
    const abs = path.join(process.cwd(), "public", filePath);
    await fs.unlink(abs).catch(() => {});
  }

  return removed;
}
