import type { DefaultUser, User } from "next-auth";
import type { postsTable } from "./db/schema";

export type PostObject = typeof postsTable.$inferSelect & { author: User };

declare module "next-auth" {
  interface Session {
    user: DefaultUser & { id: string };
  }
}
