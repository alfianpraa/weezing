"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, ShieldIcon } from "./icons";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    if (pathname === "/search") {
      setQuery(searchParams.get("q") ?? "");
    } else {
      setQuery("");
    }
  }, [pathname, searchParams]);

  function handleChange(value: string) {
    setQuery(value);
    const target = value ? `/search?q=${encodeURIComponent(value)}` : "/search";
    router.replace(target, { scroll: false });
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-black/40 px-4 py-3 backdrop-blur-md sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-initial">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="hidden h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:flex"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => router.forward()}
          aria-label="Go forward"
          className="hidden h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:flex"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <div className="relative w-full sm:ml-2 sm:w-72">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="What do you want to play?"
            className="w-full rounded-full bg-zinc-800 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-400 outline-none ring-0 focus:bg-zinc-700"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/admin"
          aria-label="Admin"
          title="Admin"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        >
          <ShieldIcon className="h-4 w-4" />
        </Link>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white">
          U
        </button>
      </div>
    </header>
  );
}
