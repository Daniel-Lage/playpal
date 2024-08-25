interface Image {
  url: string;
  height: number | null;
  width: number | null;
}

interface User {
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  type: "user";
  uri: string;
  display_name: string;
}

export interface Playlist {
  collaborative: boolean;
  description: string | null;
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: User;
  public: boolean;
  snapshot_id: string;
  tracks: Paging<PlaylistTrack>;
  type: "playlist";
  uri: string;
}

export interface Paging<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}

export interface Tokens {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface Album {
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  available_markets: string[];
  external_urls: { spotify: string };
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  restrictions?: { reason: "market" | "product" | "explicit" };
  type: "album";
  uri: string;
  artists: SimplifiedArtist[];
}

interface SimplifiedArtist {
  external_urls: { spotify: string };
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

interface Track {
  album: Album;
  artists: SimplifiedArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: { isrc?: string; ean?: string; upc?: string };
  external_urls: { spotify: string };
  href: string;
  id: string;
  is_playable: boolean;
  restrictions?: { reason: "market" | "product" | "explicit" };
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
}

export interface PlaylistTrack {
  added_at: string | null;
  added_by: User | null;
  is_local: boolean;
  track: Track;
}