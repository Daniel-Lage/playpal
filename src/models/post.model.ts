import type { User } from "next-auth";
import type { postsTable } from "~/server/db/schema";
import type { ReplyObject } from "./reply.model";
import type { LikeObject } from "./like.model";

export interface Substring {
  start: number;
  length: number;
}

export enum PostType {
  Post = "post",
  Reply = "reply",
}

export interface IMetadata {
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_image?: string;
} // meta tags

interface postRelations {
  author: User;
  likes: LikeObject[];
  replies: ReplyObject[];
  thread?: ReplyObject[];
}

export type PostObject = typeof postsTable.$inferSelect & postRelations;

interface mainPostRelations {
  author: User;
  likes?: LikeObject[];
  replies?: ReplyObject[][];
  thread?: ReplyObject[];
}

export type MainPostObject = typeof postsTable.$inferSelect & mainPostRelations;
