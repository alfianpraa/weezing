// Raw record as stored on disk (data/songs.json)
export type SongRecord = {
  id: string;
  title: string;
  artist: string;
  album: string; // falls back to the song title when the uploader leaves it blank
  cover: string; // path under /uploads or the default placeholder
  duration: number; // seconds, 0 if it could not be read from the file
  audioUrl: string; // path under /uploads
  createdAt: string; // ISO timestamp
};

// Enriched shape used throughout the UI, with derived ids for linking
// to /artist/[artistId] and /album/[albumId].
export type Track = SongRecord & {
  artistId: string;
  albumId: string;
};

export type Artist = {
  id: string;
  name: string;
  image: string;
  trackCount: number;
};

export type Album = {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  cover: string;
  trackIds: string[];
};
