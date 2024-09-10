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

export enum PlaylistsSortingColumn {
  CreatedAt = "Created at",
  Name = "Name",
  Owner = "Owner",
  Length = "Length",
}
export const PlaylistsSortingColumnOptions = Object.values(
  PlaylistsSortingColumn,
);

export enum PlaylistFeedStyle {
  Simple = "Simple",
  Detailed = "Detailed",
  Compact = "Compact",
}
export const PlaylistFeedStyleOptions = Object.values(PlaylistFeedStyle);
