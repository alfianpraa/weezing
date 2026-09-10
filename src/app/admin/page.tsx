"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { toTrack } from "@/lib/track";
import { formatTime } from "@/lib/format";
import type { SongRecord } from "@/lib/types";
import { PauseIcon, PlayIcon, ShieldIcon } from "@/components/icons";

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data: { authenticated: boolean }) => {
        if (!cancelled) setAuthenticated(Boolean(data.authenticated));
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!authChecked) {
    return <div className="pt-6 text-zinc-400">Loading…</div>;
  }

  return authenticated ? (
    <AdminDashboard onLoggedOut={() => setAuthenticated(false)} />
  ) : (
    <AdminLogin onLoggedIn={() => setAuthenticated(true)} />
  );
}

function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal login.");
        return;
      }
      onLoggedIn();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-zinc-900 p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black">
          <ShieldIcon className="h-6 w-6" />
        </div>
        <h1 className="mb-1 text-xl font-bold text-white">Admin Weezing</h1>
        <p className="mb-6 text-sm text-zinc-400">Masukkan password untuk mengelola lagu.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-3 w-full rounded-md bg-zinc-800 px-3 py-2 text-center text-sm text-white outline-none focus:ring-2 focus:ring-accent"
        />
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-full bg-accent px-6 py-2 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
        >
          {submitting ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}

function emptyForm() {
  return { title: "", artist: "", album: "" };
}

function AdminDashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingSong, setEditingSong] = useState<SongRecord | null>(null);
  const [form, setForm] = useState(emptyForm());
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  const isEditing = editingSong !== null;

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

  function resetForm() {
    setEditingSong(null);
    setForm(emptyForm());
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  function startEdit(song: SongRecord) {
    setEditingSong(song);
    setForm({
      title: song.title,
      artist: song.artist,
      // our upload fallback sets album = title for singles — leave that blank
      // in the form so it reads as "unset" rather than a real album name.
      album: song.album === song.title ? "" : song.album,
    });
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
    setError(null);
    setSuccess(null);
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    onLoggedOut();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const title = form.title.trim();
    const artist = form.artist.trim();
    const audioFile = audioInputRef.current?.files?.[0];
    const coverFile = coverInputRef.current?.files?.[0];

    if (!title || !artist) {
      setError("Judul dan artis wajib diisi.");
      return;
    }
    if (!isEditing && !audioFile) {
      setError("Pilih file audio untuk diupload.");
      return;
    }

    const body = new FormData();
    body.set("title", title);
    body.set("artist", artist);
    body.set("album", form.album.trim());
    if (audioFile) body.set("audio", audioFile);
    if (coverFile) body.set("cover", coverFile);

    setSubmitting(true);
    try {
      const url = isEditing ? `/api/songs/${editingSong.id}` : "/api/songs";
      const res = await fetch(url, { method: isEditing ? "PATCH" : "POST", body });
      const data = await res.json();
      if (res.status === 401) {
        onLoggedOut();
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan lagu.");
        return;
      }
      setSuccess(isEditing ? `"${data.song.title}" berhasil diperbarui.` : `"${data.song.title}" berhasil diupload.`);
      resetForm();
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
    if (res.status === 401) {
      onLoggedOut();
      return;
    }
    if (res.ok) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
      if (editingSong?.id === id) resetForm();
    }
  }

  return (
    <div className="pt-6 pb-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin</h1>
          <p className="text-sm text-zinc-400">Kelola lagu yang bisa diputar semua pengguna.</p>
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          Logout
        </button>
      </div>

      <div ref={formTopRef} />
      <form onSubmit={handleSubmit} className="mb-12 grid max-w-xl gap-4 rounded-lg bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? `Edit: ${editingSong.title}` : "Tambah lagu baru"}
          </h2>
          {isEditing && (
            <button type="button" onClick={resetForm} className="text-xs font-semibold text-zinc-400 hover:text-white">
              Batal
            </button>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Judul lagu
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
            value={form.artist}
            onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
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
            value={form.album}
            onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))}
            type="text"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
            placeholder="Kosongkan jika single"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="audio" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            File audio {isEditing && <span className="normal-case text-zinc-500">(kosongkan untuk tetap pakai yang lama)</span>}
          </label>
          <input
            ref={audioInputRef}
            id="audio"
            name="audio"
            type="file"
            accept="audio/*"
            required={!isEditing}
            className="text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="cover" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Cover <span className="normal-case text-zinc-500">(opsional{isEditing ? ", kosongkan untuk tetap pakai yang lama" : ""})</span>
          </label>
          <input
            ref={coverInputRef}
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
          {submitting ? "Menyimpan…" : isEditing ? "Simpan perubahan" : "Upload lagu"}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-bold text-white">Lagu terupload ({songs.length})</h2>
      {loading ? (
        <p className="text-zinc-400">Loading…</p>
      ) : songs.length === 0 ? (
        <p className="text-zinc-400">Belum ada lagu yang diupload.</p>
      ) : (
        <AdminSongList songs={songs} onDelete={handleDelete} onEdit={startEdit} editingId={editingSong?.id ?? null} />
      )}
    </div>
  );
}

function AdminSongList({
  songs,
  onDelete,
  onEdit,
  editingId,
}: {
  songs: SongRecord[];
  onDelete: (id: string, title: string) => void;
  onEdit: (song: SongRecord) => void;
  editingId: string | null;
}) {
  const { current, isPlaying, playQueue, togglePlay } = usePlayer();
  const tracks = songs.map(toTrack);

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-400">
            <th className="w-12 px-4 py-2"></th>
            <th className="px-2 py-2 font-normal">Title</th>
            <th className="hidden px-2 py-2 font-normal md:table-cell">Album</th>
            <th className="w-16 px-4 py-2 text-right font-normal">Durasi</th>
            <th className="w-32 px-4 py-2 text-right font-normal">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => {
            const song = songs[index];
            const isCurrent = current?.id === track.id;
            const isBeingEdited = editingId === track.id;
            return (
              <tr
                key={track.id}
                className={`group border-b border-zinc-900 last:border-0 hover:bg-white/5 ${isBeingEdited ? "bg-white/5" : ""}`}
              >
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
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => onEdit(song)}
                      className="text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(track.id, track.title)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
