import type { User } from "next-auth";
import type { postsTable } from "~/server/db/schema";

export interface IMetadata {
  viewport?: string;
  description?: string;
  og?: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    type?: string;
  };
  music?: { creator?: string };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
  };
}

export type PostObject = typeof postsTable.$inferSelect & { author: User };

interface urlInPost {
  url: string;
  index: number;
}

export type PostWithMetadata = PostObject & {
  metadata?: IMetadata;
  urls?: urlInPost[];
};
