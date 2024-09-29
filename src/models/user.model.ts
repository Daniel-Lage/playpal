import type { usersTable } from "./../server/db/schema";
import type { FollowObject } from "./follow.model";
import type { LikeObject } from "./like.model";
import type { PostObject } from "./post.model";

export interface SimplifiedUser {
  external_urls: { spotify: string };
  followers: { href: string | null; total: number };
  href: string;
  id: string;
  type: "user";
  uri: string;
  display_name: string;
}

export interface SpotifyUser extends SimplifiedUser {
  country: string;
  email: string;
  explicit_content: { filter_enabled: boolean; filter_locked: boolean };
  product: "premium" | "free" | "open";
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
  interface User {
    providerAccountId: string;
  }
}

interface userRelations {
  posts: PostObject[];
  likes: LikeObject[];
  following: FollowObject[];
  followers: FollowObject[];
}

export type UserObject = typeof usersTable.$inferSelect & userRelations;

export enum ProfileTab {
  Posts = "Posts",
  PostsAndReplies = "Posts and Replies",
  Likes = "Likes",
  Playlists = "Playlists",
}

export const ProfileTabOptions = Object.values(ProfileTab);
