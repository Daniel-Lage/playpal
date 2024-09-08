import type { User } from "next-auth";
import type { postsTable } from "~/server/db/schema";

export type PostObject = typeof postsTable.$inferSelect & { author: User };
