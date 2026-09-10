"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import { HomeIcon, LibraryIcon, SearchIcon, HeartIcon } from "./icons";

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
        active ? "text-white" : "text-zinc-400 hover:text-white"
      }`}
    >
      <span className="h-6 w-6">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { likedIds } = usePlayer();

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-2 bg-black p-2 text-sm md:flex">
      <div className="rounded-lg bg-zinc-900 p-4">
        <Link href="/" className="mb-6 flex items-center gap-2 px-1 text-xl font-extrabold tracking-tight text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.6.6 0 0 1-.83.2c-2.28-1.4-5.14-1.71-8.52-.94a.63.63 0 1 1-.28-1.23c3.7-.84 6.87-.48 9.43 1.13.29.18.38.55.2.84Zm1.22-2.72a.75.75 0 0 1-1.03.25c-2.61-1.6-6.59-2.07-9.68-1.13a.75.75 0 1 1-.44-1.44c3.53-1.07 7.9-.54 10.9 1.3.36.22.47.68.25 1.02Zm.11-2.83c-3.13-1.86-8.3-2.03-11.29-1.12a.9.9 0 1 1-.52-1.72c3.43-1.04 9.14-.84 12.75 1.3a.9.9 0 0 1-.94 1.54Z" />
            </svg>
          </span>
          Weezing
        </Link>
        <nav className="flex flex-col gap-1">
          <NavLink href="/" icon={<HomeIcon className="h-6 w-6" />} label="Home" />
          <NavLink href="/search" icon={<SearchIcon className="h-6 w-6" />} label="Search" />
        </nav>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-zinc-900">
        <div className="flex items-center px-4 pt-4">
          <span className="flex items-center gap-3 text-sm font-semibold text-zinc-400">
            <LibraryIcon className="h-6 w-6" />
            Your Library
          </span>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          <Link
            href="/liked"
            className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-blue-300">
              <HeartIcon filled className="h-6 w-6 text-white" />
            </span>
            <span className="flex flex-col overflow-hidden">
              <span className="truncate font-medium text-white">Liked Songs</span>
              <span className="truncate text-xs text-zinc-400">{likedIds.size} songs</span>
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
