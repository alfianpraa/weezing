import Link from "next/link";
import { getAlbums, getAllTracks, getArtists, getTracksByArtist, getTracksByIds } from "@/lib/data";
import MediaCard from "@/components/MediaCard";
import Row from "@/components/Row";
import TrackTable from "@/components/TrackTable";
import { PlusCircleIcon } from "@/components/icons";

// The song catalog changes at runtime (admin uploads), so this can't be
// statically prerendered at build time — it would freeze at whatever
// existed when `docker build` ran (usually nothing).
export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function Home() {
  const [tracks, albums, artists] = await Promise.all([getAllTracks(), getAlbums(), getArtists()]);

  const albumSections = await Promise.all(
    albums.map(async (album) => ({ album, tracks: await getTracksByIds(album.trackIds) }))
  );
  const artistSections = await Promise.all(
    artists.map(async (artist) => ({ artist, tracks: await getTracksByArtist(artist.id) }))
  );

  return (
    <div className="pt-6">
      <h1 className="mb-6 text-3xl font-bold text-white">{getGreeting()}</h1>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-zinc-700 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-white">Belum ada lagu di perpustakaan</p>
          <p className="max-w-md text-sm text-zinc-400">
            Upload lagu pertamamu lewat halaman Admin supaya bisa langsung diputar di sini.
          </p>
          <Link
            href="/admin"
            className="mt-2 flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:scale-105"
          >
            <PlusCircleIcon className="h-4 w-4" />
            Buka halaman Admin
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">All Songs</h2>
            <TrackTable tracks={tracks} />
          </section>

          {albumSections.length > 0 && (
            <Row title="Albums">
              {albumSections.map(({ album, tracks: albumTracks }) => (
                <MediaCard
                  key={album.id}
                  href={`/album/${album.id}`}
                  image={album.cover}
                  title={album.title}
                  subtitle={album.artist}
                  tracks={albumTracks}
                />
              ))}
            </Row>
          )}

          {artistSections.length > 0 && (
            <Row title="Artists">
              {artistSections.map(({ artist, tracks: artistTracks }) => (
                <MediaCard
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  image={artist.image}
                  title={artist.name}
                  subtitle="Artist"
                  tracks={artistTracks}
                  circular
                />
              ))}
            </Row>
          )}
        </>
      )}
    </div>
  );
}
