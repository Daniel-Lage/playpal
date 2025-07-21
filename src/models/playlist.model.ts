import type { playlistsTable } from "~/server/db/schema";
import type { Image } from "./image.model";
import type { Paging } from "./paging.model";
import type { PlaylistTrack } from "./track.model";
import type { SimplifiedUser } from "./user.model";
import type { User } from "next-auth";
import type { PlaylistLikeObject } from "./like.model";
import type { PostObject } from "./post.model";

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
  Length = "Length",
}
export const PlaylistsSortingColumnOptions = Object.values(
  PlaylistsSortingColumn,
);

export enum PlaylistFeedStyle {
  Grid = "Grid",
  Row = "Row",
  Compact = "Compact",
}
export const PlaylistFeedStyleOptions = Object.values(PlaylistFeedStyle);

export enum PlayerStatus {
  Disabled = "Disabled",
  Ready = "Ready",
  Busy = "Busy",
}

interface playlistRelations {
  owner: User;
  likes?: PlaylistLikeObject[];
  replies?: PostObject[];
  replyThreads?: PostObject[][];
}

export type PlaylistObject = typeof playlistsTable.$inferSelect &
  playlistRelations;

export enum PlaylistTab {
  Tracks,
  Likes,
  Replies,
}
