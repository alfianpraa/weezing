import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbumById, getTracksByIds } from "@/lib/data";
import { formatDurationLong } from "@/lib/format";
import PlayHeaderButton from "@/components/PlayHeaderButton";
import TrackTable from "@/components/TrackTable";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await getAlbumById(id);
  if (!album) notFound();

  const albumTracks = await getTracksByIds(album.trackIds);
  const totalSeconds = albumTracks.reduce((sum, t) => sum + t.duration, 0);

  return (
    <div>
      <div className="flex flex-col gap-6 bg-gradient-to-b from-blue-900/60 to-transparent px-2 pt-10 pb-6 sm:flex-row sm:items-end">
        <Image
          src={album.cover}
          alt={album.title}
          width={232}
          height={232}
          className="h-56 w-56 shrink-0 rounded-md object-cover shadow-2xl"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Album</p>
          <h1 className="mt-2 truncate text-4xl font-extrabold text-white sm:text-6xl">{album.title}</h1>
          <p className="mt-4 text-sm text-zinc-300">
            <Link href={`/artist/${album.artistId}`} className="font-semibold text-white hover:underline">
              {album.artist}
            </Link>
            {" • "}
            {albumTracks.length} songs, {formatDurationLong(totalSeconds)}
          </p>
        </div>
      </div>

      <div className="px-2 py-6">
        <div className="mb-6">
          <PlayHeaderButton tracks={albumTracks} />
        </div>
        <TrackTable tracks={albumTracks} showAlbum={false} />
      </div>
    </div>
  );
}
