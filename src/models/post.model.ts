import type { User } from "next-auth";
import type { postsTable } from "~/server/db/schema";

export interface IMetadata {
  url?: string;
  image?: string;
  title?: string;
  description?: string;
}
export type PostObject = typeof postsTable.$inferSelect & { author: User };

export type PostWithMetadata = PostObject & { metadata?: IMetadata };
