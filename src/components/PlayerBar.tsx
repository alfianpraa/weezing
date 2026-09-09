"use client";

import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/format";
import {
  HeartIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "./icons";

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    repeatMode,
    likedIds,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
  } = usePlayer();

  const liked = current ? likedIds.has(current.id) : false;

  return (
    <div className="flex h-24 shrink-0 items-center gap-4 border-t border-zinc-800 bg-zinc-950 px-4">
      {/* Now playing */}
      <div className="flex w-1/4 min-w-0 items-center gap-3">
        {current ? (
          <>
            <Image
              src={current.cover}
              alt={current.album}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded object-cover"
            />
            <div className="min-w-0">
              <Link
                href={`/album/${current.albumId}`}
                className="block truncate text-sm font-medium text-white hover:underline"
              >
                {current.title}
              </Link>
              <Link
                href={`/artist/${current.artistId}`}
                className="block truncate text-xs text-zinc-400 hover:text-white hover:underline"
              >
                {current.artist}
              </Link>
            </div>
            <button
              onClick={() => toggleLike(current.id)}
              aria-label={liked ? "Unlike" : "Like"}
              className={`ml-2 shrink-0 transition-colors ${liked ? "text-accent" : "text-zinc-400 hover:text-white"}`}
            >
              <HeartIcon filled={liked} className="h-4 w-4" />
            </button>
          </>
        ) : (
          <span className="text-xs text-zinc-500">No song playing</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex w-1/2 flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            className={`transition-colors ${shuffle ? "text-accent" : "text-zinc-400 hover:text-white"}`}
          >
            <ShuffleIcon className="h-4 w-4" />
          </button>
          <button onClick={prev} aria-label="Previous" className="text-zinc-300 hover:text-white">
            <SkipBackIcon className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!current}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-40"
          >
            {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4 translate-x-[1px]" />}
          </button>
          <button onClick={next} aria-label="Next" className="text-zinc-300 hover:text-white">
            <SkipForwardIcon className="h-5 w-5" />
          </button>
          <button
            onClick={cycleRepeat}
            aria-label="Toggle repeat"
            className={`transition-colors ${repeatMode !== "off" ? "text-accent" : "text-zinc-400 hover:text-white"}`}
          >
            {repeatMode === "one" ? <RepeatOneIcon className="h-4 w-4" /> : <RepeatIcon className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex w-full items-center gap-2 text-xs text-zinc-400">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Math.min(progress, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={!current}
            className="w-full appearance-none rounded-full bg-zinc-700 disabled:opacity-40"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex w-1/4 items-center justify-end gap-2">
        <button
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
          aria-label="Toggle mute"
          className="text-zinc-400 hover:text-white"
        >
          {volume === 0 ? <VolumeMuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 appearance-none rounded-full bg-zinc-700"
        />
      </div>
    </div>
  );
}
