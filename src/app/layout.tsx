import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PlayerBar from "@/components/PlayerBar";
import MobileNav from "@/components/MobileNav";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weezing — Music for everyone",
  description: "A Spotify-inspired music streaming demo built with Next.js.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-black">
        <PlayerProvider>
          <div className="flex h-dvh flex-col bg-black">
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Suspense fallback={null}>
                  <TopBar />
                </Suspense>
                <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-800/60 to-black px-4 pb-6 sm:px-6">
                  {children}
                </main>
              </div>
            </div>
            <PlayerBar />
            <MobileNav />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
