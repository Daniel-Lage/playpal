import type { likesTable, playlistLikesTable } from "~/server/db/schema";
import type { PostObject } from "./post.model";
import type { UserObject } from "./user.model";
import type { User } from "next-auth";
import type { PlaylistObject } from "./playlist.model";

interface likeRelations {
  likee?: PostObject;
  liker?: UserObject | User;
}

export type LikeObject = typeof likesTable.$inferSelect & likeRelations;

interface playlistLikeRelations {
  likee?: PlaylistObject;
  liker?: UserObject | User;
}

export type PlaylistLikeObject = typeof playlistLikesTable.$inferSelect &
  playlistLikeRelations;
