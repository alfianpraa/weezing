"use client";

import type { Track } from "@/lib/types";
import { usePlayer } from "@/context/PlayerContext";
import { PauseIcon, PlayIcon } from "./icons";

export default function PlayHeaderButton({ tracks }: { tracks: Track[] }) {
  const { current, isPlaying, playQueue, togglePlay } = usePlayer();

  const isThisPlaying = isPlaying && !!current && tracks.some((t) => t.id === current.id);

  function handleClick() {
    if (tracks.length === 0) return;
    if (current && tracks.some((t) => t.id === current.id)) {
      togglePlay();
      return;
    }
    playQueue(tracks, 0);
  }

  return (
    <button
      onClick={handleClick}
      disabled={tracks.length === 0}
      aria-label={isThisPlaying ? "Pause" : "Play"}
      className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-black shadow-xl transition hover:scale-105 disabled:opacity-40"
    >
      {isThisPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6 translate-x-[2px]" />}
    </button>
  );
}
