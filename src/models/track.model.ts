import type { Album } from "./album.model";
import type { SimplifiedArtist } from "./artist.model";
import type { SimplifiedUser } from "./user.model";

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
  added_by: SimplifiedUser | null;
  is_local: boolean;
  track: Track;
}

export type tracksSortingColumn = "Added at" | "Name" | "Album" | "Artists";
