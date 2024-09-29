import type { likesTable } from "~/server/db/schema";
import type { PostObject } from "./post.model";
import type { UserObject } from "./user.model";

interface likeRelations {
  likee?: PostObject;
  liker?: UserObject;
}

export type LikeObject = typeof likesTable.$inferSelect & likeRelations;
