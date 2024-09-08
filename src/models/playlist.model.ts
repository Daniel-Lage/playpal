import type { Image } from "./image.model";
import type { Paging } from "./paging.model";
import type { PlaylistTrack } from "./track.model";
import type { SimplifiedUser } from "./user.model";

export interface Playlist {
  collaborative: boolean;
  description: string | null;
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: SimplifiedUser;
  public: boolean;
  snapshot_id: string;
  tracks: Paging<PlaylistTrack>;
  type: "playlist";
  uri: string;
}

export type playlistsSortingColumn = "Created at" | "Name" | "Owner";
