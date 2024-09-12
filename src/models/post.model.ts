import type { User } from "next-auth";
import type { postsTable } from "~/server/db/schema";

export interface IMetadata {
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_image?: string;
} // meta tags that i use

export type PostObject = typeof postsTable.$inferSelect & { author: User };

interface urlInPost {
  url: string;
  index: number;
}

export type PostWithMetadata = PostObject & {
  metadata?: IMetadata;
  urls?: urlInPost[];
};
