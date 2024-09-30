import type { likesTable } from "~/server/db/schema";
import type { PostObject } from "./post.model";
import type { UserObject } from "./user.model";
import type { User } from "next-auth";

interface likeRelations {
  likee?: PostObject;
  liker?: UserObject | User;
}

export type LikeObject = typeof likesTable.$inferSelect & likeRelations;
