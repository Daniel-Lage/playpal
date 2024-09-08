import type { SimplifiedArtist } from "./artist.model";
import type { Image } from "./image.model";

export interface Album {
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
