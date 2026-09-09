"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "./icons";

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
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-black/40 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => router.forward()}
          aria-label="Go forward"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <div className="relative ml-2 w-72">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="What do you want to play?"
            className="w-full rounded-full bg-zinc-800 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-400 outline-none ring-0 focus:bg-zinc-700"
          />
        </div>
      </div>

      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white">
        U
      </button>
    </header>
  );
}
