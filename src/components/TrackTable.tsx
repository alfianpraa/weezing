"use client";

import Image from "next/image";
import Link from "next/link";
import type { Track } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/format";
import { HeartIcon, PauseIcon, PlayIcon } from "./icons";

export default function TrackTable({
  tracks,
  showAlbum = true,
}: {
  tracks: Track[];
  showAlbum?: boolean;
}) {
  const { current, isPlaying, playQueue, togglePlay, likedIds, toggleLike } = usePlayer();

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-400">
          <th className="w-12 px-4 py-2 text-right font-normal">#</th>
          <th className="px-2 py-2 font-normal">Title</th>
          {showAlbum && <th className="hidden px-2 py-2 font-normal md:table-cell">Album</th>}
          <th className="w-12 px-2 py-2 font-normal"></th>
          <th className="w-16 px-4 py-2 text-right font-normal">
            <span className="inline-block">⏱</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track, index) => {
          const isCurrent = current?.id === track.id;
          const liked = likedIds.has(track.id);

          function handleRowPlay() {
            if (isCurrent) {
              togglePlay();
            } else {
              playQueue(tracks, index);
            }
          }

          return (
            <tr key={`${track.id}-${index}`} className="group rounded-md hover:bg-white/10">
              <td className="w-12 px-4 py-2 text-right">
                <button
                  onClick={handleRowPlay}
                  aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                  className="relative flex h-5 w-5 items-center justify-center"
                >
                  <span className={`text-sm ${isCurrent ? "text-accent" : "text-zinc-400"} group-hover:hidden`}>
                    {isCurrent && isPlaying ? (
                      <span className="flex items-end gap-[2px]">
                        <span className="h-2 w-[2px] animate-pulse bg-accent" />
                        <span className="h-3 w-[2px] animate-pulse bg-accent" />
                        <span className="h-1.5 w-[2px] animate-pulse bg-accent" />
                      </span>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="hidden text-white group-hover:block">
                    {isCurrent && isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4 translate-x-[1px]" />
                    )}
                  </span>
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
                    <Link
                      href={`/artist/${track.artistId}`}
                      className="truncate text-xs text-zinc-400 hover:text-white hover:underline"
                    >
                      {track.artist}
                    </Link>
                  </div>
                </div>
              </td>
              {showAlbum && (
                <td className="hidden px-2 py-2 md:table-cell">
                  <Link
                    href={`/album/${track.albumId}`}
                    className="truncate text-zinc-400 hover:text-white hover:underline"
                  >
                    {track.album}
                  </Link>
                </td>
              )}
              <td className="px-2 py-2">
                <button
                  onClick={() => toggleLike(track.id)}
                  aria-label={liked ? "Unlike" : "Like"}
                  className={`opacity-0 transition-opacity group-hover:opacity-100 ${
                    liked ? "text-accent opacity-100" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <HeartIcon filled={liked} className="h-4 w-4" />
                </button>
              </td>
              <td className="px-4 py-2 text-right text-zinc-400">{formatTime(track.duration)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
