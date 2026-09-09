"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { toTrack } from "@/lib/track";
import { formatTime } from "@/lib/format";
import type { SongRecord } from "@/lib/types";
import { PauseIcon, PlayIcon } from "@/components/icons";

export default function AdminPage() {
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      setSongs(data.songs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    const artist = String(formData.get("artist") ?? "").trim();
    const audio = formData.get("audio");

    if (!title || !artist) {
      setError("Judul dan artis wajib diisi.");
      return;
    }
    if (!(audio instanceof File) || audio.size === 0) {
      setError("Pilih file audio untuk diupload.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/songs", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengupload lagu.");
        return;
      }
      setSuccess(`"${data.song.title}" berhasil diupload.`);
      form.reset();
      await fetchSongs();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Hapus "${title}" dari perpustakaan?`)) return;
    const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="pt-6 pb-10">
      <h1 className="mb-2 text-3xl font-bold text-white">Admin</h1>
      <p className="mb-8 text-sm text-zinc-400">Upload lagu supaya bisa diputar oleh semua pengguna.</p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mb-12 grid max-w-xl gap-4 rounded-lg bg-zinc-900 p-6"
      >
        <div className="grid gap-1.5">
          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Judul lagu
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
            placeholder="cth. Paper Lanterns"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="artist" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Artis
          </label>
          <input
            id="artist"
            name="artist"
            type="text"
            required
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
            placeholder="cth. Nova Winters"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="album" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Album <span className="normal-case text-zinc-500">(opsional)</span>
          </label>
          <input
            id="album"
            name="album"
            type="text"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
            placeholder="Kosongkan jika single"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="audio" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            File audio
          </label>
          <input
            id="audio"
            name="audio"
            type="file"
            accept="audio/*"
            required
            className="text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="cover" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Cover <span className="normal-case text-zinc-500">(opsional)</span>
          </label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            className="text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-accent">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 justify-self-start rounded-full bg-accent px-6 py-2 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
        >
          {submitting ? "Mengupload…" : "Upload lagu"}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-bold text-white">Lagu terupload ({songs.length})</h2>
      {loading ? (
        <p className="text-zinc-400">Loading…</p>
      ) : songs.length === 0 ? (
        <p className="text-zinc-400">Belum ada lagu yang diupload.</p>
      ) : (
        <AdminSongList songs={songs} onDelete={handleDelete} />
      )}
    </div>
  );
}

function AdminSongList({
  songs,
  onDelete,
}: {
  songs: SongRecord[];
  onDelete: (id: string, title: string) => void;
}) {
  const { current, isPlaying, playQueue, togglePlay } = usePlayer();
  const tracks = songs.map(toTrack);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-400">
            <th className="w-12 px-4 py-2"></th>
            <th className="px-2 py-2 font-normal">Title</th>
            <th className="hidden px-2 py-2 font-normal md:table-cell">Album</th>
            <th className="w-16 px-4 py-2 text-right font-normal">Durasi</th>
            <th className="w-20 px-4 py-2 text-right font-normal">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            const isCurrent = current?.id === track.id;
            return (
              <tr key={track.id} className="group border-b border-zinc-900 last:border-0 hover:bg-white/5">
                <td className="px-4 py-2">
                  <button
                    onClick={() => (isCurrent ? togglePlay() : playQueue(tracks, index))}
                    aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:text-white"
                  >
                    {isCurrent && isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4 translate-x-[1px]" />
                    )}
                  </button>
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-3">
                    <Image
                      src={track.cover}
                      alt={track.album}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${isCurrent ? "text-accent" : "text-white"}`}>
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-zinc-400">{track.artist}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden truncate px-2 py-2 text-zinc-400 md:table-cell">{track.album}</td>
                <td className="px-4 py-2 text-right text-zinc-400">{formatTime(track.duration)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => onDelete(track.id, track.title)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
