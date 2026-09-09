import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PlayerBar from "@/components/PlayerBar";
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
  title: "Wavelength — Music for everyone",
  description: "A Spotify-inspired music streaming demo built with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-black">
        <PlayerProvider>
          <div className="flex h-screen flex-col bg-black">
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Suspense fallback={null}>
                  <TopBar />
                </Suspense>
                <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-800/60 to-black px-6 pb-6">
                  {children}
                </main>
              </div>
            </div>
            <PlayerBar />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
