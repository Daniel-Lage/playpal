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

/*

{ 
id: string
userId: string
type: PostType
content: string
createdAt: Date
updatedAt: Date | null
urls: Substring[] | null
urlMetadata: IMetadata | null

author: { ... }
likes: { ... }[]
replies: { ... }[]
}[]' to type 'PostObject[]'

*/

interface clientPostRelations {
  author: User;
  likes?: LikeObject[];
  replies?: ReplyObject[][];
  thread?: ReplyObject[];
}

export type ClientPostObject = typeof postsTable.$inferSelect &
  clientPostRelations;

export interface parentPostObject {
  id: string;
  thread?: ReplyObject[];
}

export enum threadPosition {
  First = "First",
  Middle = "Middle",
  Last = "Last",
}
