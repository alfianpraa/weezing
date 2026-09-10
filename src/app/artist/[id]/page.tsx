import Image from "next/image";
import { notFound } from "next/navigation";
import { getAlbums, getArtistById, getTracksByArtist, getTracksByIds } from "@/lib/data";
import PlayHeaderButton from "@/components/PlayHeaderButton";
import TrackTable from "@/components/TrackTable";
import MediaCard from "@/components/MediaCard";
import Row from "@/components/Row";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) notFound();

  const [artistTracks, allAlbums] = await Promise.all([getTracksByArtist(artist.id), getAlbums()]);
  const artistAlbums = allAlbums.filter((a) => a.artistId === artist.id);
  const popularTracks = artistTracks.slice(0, 5);

  return (
    <div>
      <div className="relative flex h-56 items-end overflow-hidden rounded-b-lg sm:h-96">
        <Image src={artist.image} alt={artist.name} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
        <div className="relative z-10 px-2 pb-6 sm:px-4">
          <h1 className="text-3xl font-extrabold text-white drop-shadow sm:text-5xl lg:text-7xl">{artist.name}</h1>
          <p className="mt-3 text-sm text-zinc-200">
            {artist.trackCount} {artist.trackCount === 1 ? "song" : "songs"}
          </p>
        </div>
      </div>

      <div className="px-2 py-6 sm:px-4">
        <div className="mb-8">
          <PlayHeaderButton tracks={artistTracks} />
        </div>

        <h2 className="mb-3 text-xl font-bold text-white">Popular</h2>
        <TrackTable tracks={popularTracks} />

        {artistAlbums.length > 0 && (
          <div className="mt-10">
            <Row title="Albums">
              {await Promise.all(
                artistAlbums.map(async (album) => (
                  <MediaCard
                    key={album.id}
                    href={`/album/${album.id}`}
                    image={album.cover}
                    title={album.title}
                    subtitle="Album"
                    tracks={await getTracksByIds(album.trackIds)}
                  />
                ))
              )}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
