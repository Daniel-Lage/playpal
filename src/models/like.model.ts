import type { likesTable } from "~/server/db/schema";
import type { PostObject } from "./post.model";

interface likeRelations {
  likedPost?: PostObject;
  userLiked?: PostObject;
}

export type LikeObject = typeof likesTable.$inferSelect & likeRelations;
