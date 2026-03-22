import type { User } from "next-auth";
import type { postsTable } from "~/server/db/schema";
import type { ReplyObject } from "./reply.model";
import type { LikeObject } from "./like.model";
import type { PlaylistObject } from "./playlist.model";

export interface ILink {
  href: string;
  metadata?: IMetadata;
}

export enum PostType {
  Post = "post",
  Reply = "reply",
}

export interface IMetadata {
  og_title?: string;
  og_site_name?: string;
  og_description?: string;
  og_url?: string;
  og_image?: string;
  "theme-color"?: string;
}

interface pr {
  author: User;
  likes?: LikeObject[];
  thread?: ReplyObject[];
  playlist?: PlaylistObject;
}

type postRelations = {
  replies: ReplyObject[];
} & pr;

export type PostObject = typeof postsTable.$inferSelect & postRelations;

type mainPostRelations = {
  replyThreads?: ReplyObject[][];
} & pr;

export type MainPostObject = typeof postsTable.$inferSelect & mainPostRelations;

export enum PostsSortingColumn {
  CreatedAt = "Created at",
  Replies = "Replies",
  Likes = "Likes",
}
export const PostsSortingColumnOptions = Object.values(PostsSortingColumn);
