import { readSongs } from "./songStore";
import { toTrack } from "./track";
import { DEFAULT_COVER } from "./constants";
import type { Album, Artist, Track } from "./types";

export async function getAllTracks(): Promise<Track[]> {
  const songs = await readSongs();
  return songs
    .map(toTrack)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTrackById(id: string): Promise<Track | undefined> {
  const tracks = await getAllTracks();
  return tracks.find((t) => t.id === id);
}

export async function getTracksByIds(ids: string[]): Promise<Track[]> {
  const tracks = await getAllTracks();
  const byId = new Map(tracks.map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter((t): t is Track => Boolean(t));
}

export async function getArtists(): Promise<Artist[]> {
  const tracks = await getAllTracks();
  const map = new Map<string, Artist>();
  for (const track of tracks) {
    const existing = map.get(track.artistId);
    if (existing) {
      existing.trackCount += 1;
    } else {
      map.set(track.artistId, {
        id: track.artistId,
        name: track.artist,
        image: track.cover || DEFAULT_COVER,
        trackCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const artists = await getArtists();
  return artists.find((a) => a.id === id);
}

export async function getTracksByArtist(artistId: string): Promise<Track[]> {
  const tracks = await getAllTracks();
  return tracks.filter((t) => t.artistId === artistId);
}

export async function getAlbums(): Promise<Album[]> {
  const tracks = await getAllTracks();
  const map = new Map<string, Album>();
  // oldest-first within an album so track order makes sense
  const chronological = [...tracks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  for (const track of chronological) {
    const existing = map.get(track.albumId);
    if (existing) {
      existing.trackIds.push(track.id);
    } else {
      map.set(track.albumId, {
        id: track.albumId,
        title: track.album,
        artistId: track.artistId,
        artist: track.artist,
        cover: track.cover || DEFAULT_COVER,
        trackIds: [track.id],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAlbumById(id: string): Promise<Album | undefined> {
  const albums = await getAlbums();
  return albums.find((a) => a.id === id);
}
