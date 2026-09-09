"use client";

import { useEffect, useState } from "react";
import { HeartIcon } from "@/components/icons";
import PlayHeaderButton from "@/components/PlayHeaderButton";
import TrackTable from "@/components/TrackTable";
import { usePlayer } from "@/context/PlayerContext";
import { toTrack } from "@/lib/track";
import { formatDurationLong } from "@/lib/format";
import type { SongRecord, Track } from "@/lib/types";

export default function LikedSongsPage() {
  const { likedIds } = usePlayer();
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/songs")
      .then((res) => res.json())
      .then((data: { songs: SongRecord[] }) => {
        if (cancelled) return;
        setAllTracks(data.songs.map(toTrack));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const likedTracks = allTracks.filter((t) => likedIds.has(t.id));
  const totalSeconds = likedTracks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div>
      <div className="flex flex-col gap-6 bg-gradient-to-b from-indigo-800/60 to-transparent px-2 pt-10 pb-6 sm:flex-row sm:items-end">
        <div className="flex h-56 w-56 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-blue-300 shadow-2xl">
          <HeartIcon filled className="h-24 w-24 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Playlist</p>
          <h1 className="mt-2 truncate text-4xl font-extrabold text-white sm:text-6xl">Liked Songs</h1>
          <p className="mt-4 text-sm text-zinc-300">
            {likedTracks.length} songs
            {likedTracks.length > 0 && `, ${formatDurationLong(totalSeconds)}`}
          </p>
        </div>
      </div>

      <div className="px-2 py-6">
        {loading ? (
          <p className="text-zinc-400">Loading…</p>
        ) : likedTracks.length === 0 ? (
          <p className="text-zinc-400">
            Songs you like will appear here. Tap the heart icon on any song to save it.
          </p>
        ) : (
          <>
            <div className="mb-6">
              <PlayHeaderButton tracks={likedTracks} />
            </div>
            <TrackTable tracks={likedTracks} />
          </>
        )}
      </div>
    </div>
  );
}
