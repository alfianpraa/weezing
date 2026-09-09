import { getAlbums, getAllTracks, getArtists, getTracksByArtist, getTracksByIds } from "@/lib/data";
import MediaCard from "@/components/MediaCard";
import TrackTable from "@/components/TrackTable";
import Row from "@/components/Row";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  if (!query) {
    const [albums, artists] = await Promise.all([getAlbums(), getArtists()]);
    const [albumSections, artistSections] = await Promise.all([
      Promise.all(albums.map(async (album) => ({ album, tracks: await getTracksByIds(album.trackIds) }))),
      Promise.all(artists.map(async (artist) => ({ artist, tracks: await getTracksByArtist(artist.id) }))),
    ]);

    return (
      <div className="pt-6">
        <h1 className="mb-6 text-2xl font-bold text-white">Browse your library</h1>
        {albumSections.length === 0 && artistSections.length === 0 ? (
          <p className="text-zinc-400">Ketik sesuatu untuk mencari lagu, album, atau artis.</p>
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  }

  const tracks = await getAllTracks();

  const matchedTracks = tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.album.toLowerCase().includes(query)
  );

  const matchedArtistNames = new Set(matchedTracks.map((t) => t.artistId));
  const matchedAlbumIds = new Set(matchedTracks.map((t) => t.albumId));

  const [allArtists, allAlbums] = await Promise.all([getArtists(), getAlbums()]);
  const matchedArtists = allArtists.filter(
    (a) => a.name.toLowerCase().includes(query) || matchedArtistNames.has(a.id)
  );
  const matchedAlbums = allAlbums.filter(
    (a) => a.title.toLowerCase().includes(query) || matchedAlbumIds.has(a.id)
  );

  const hasResults = matchedTracks.length > 0 || matchedArtists.length > 0 || matchedAlbums.length > 0;

  return (
    <div className="pt-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Results for &ldquo;{q}&rdquo;</h1>

      {!hasResults && <p className="text-zinc-400">No results found. Try a different search.</p>}

      {matchedTracks.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-white">Songs</h2>
          <TrackTable tracks={matchedTracks} />
        </section>
      )}

      {matchedArtists.length > 0 && (
        <Row title="Artists">
          {await Promise.all(
            matchedArtists.map(async (artist) => (
              <MediaCard
                key={artist.id}
                href={`/artist/${artist.id}`}
                image={artist.image}
                title={artist.name}
                subtitle="Artist"
                tracks={await getTracksByArtist(artist.id)}
                circular
              />
            ))
          )}
        </Row>
      )}

      {matchedAlbums.length > 0 && (
        <Row title="Albums">
          {await Promise.all(
            matchedAlbums.map(async (album) => (
              <MediaCard
                key={album.id}
                href={`/album/${album.id}`}
                image={album.cover}
                title={album.title}
                subtitle={album.artist}
                tracks={await getTracksByIds(album.trackIds)}
              />
            ))
          )}
        </Row>
      )}
    </div>
  );
}
