"use client";

import Image from "next/image";
import Link from "next/link";
import type { Track } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { PauseIcon, PlayIcon } from "./icons";

export default function MediaCard({
  href,
  image,
  title,
  subtitle,
  tracks,
  circular = false,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  tracks: Track[];
  circular?: boolean;
}) {
  const { current, isPlaying, playQueue, togglePlay } = usePlayer();

  const isThisPlaying = isPlaying && !!current && tracks.some((t) => t.id === current.id);

  function handlePlayClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (tracks.length === 0) return;
    if (isThisPlaying) {
      togglePlay();
      return;
    }
    if (current && tracks.some((t) => t.id === current.id)) {
      togglePlay();
      return;
    }
    playQueue(tracks, 0);
  }

  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 rounded-md bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800"
    >
      <div className="relative">
        <Image
          src={image}
          alt={title}
          width={200}
          height={200}
          className={`aspect-square w-full object-cover shadow-lg ${circular ? "rounded-full" : "rounded-md"}`}
        />
        <button
          onClick={handlePlayClick}
          aria-label={isThisPlaying ? "Pause" : "Play"}
          className="absolute bottom-2 right-2 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105"
        >
          {isThisPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5 translate-x-[1px]" />}
        </button>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="mt-1 truncate text-xs text-zinc-400">{subtitle}</p>}
      </div>
    </Link>
  );
}
