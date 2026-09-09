import { slugify } from "./slugify";
import type { SongRecord, Track } from "./types";

// Pure, client-safe: derives the linkable artist/album ids from a raw
// song record. Used both by the server-only data layer and by client
// components that fetch raw records from /api/songs.
export function toTrack(record: SongRecord): Track {
  const artistId = slugify(record.artist);
  const albumId = slugify(`${record.artist}-${record.album}`);
  return { ...record, artistId, albumId };
}
