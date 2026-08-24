import type { usersTable } from "~/server/db/schema";
import type { FollowObject } from "./follow.model";
import type { LikeObject } from "./like.model";
import type { PostObject } from "./post.model";
import type { User } from "next-auth";

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

export interface SpotifyProfile extends SpotifyUser {
  account_id: string;
  images: [
    {
      url: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228";
      height: 300;
      width: 300;
    },
  ];
}

export type SessionUser = User & {
  access_token: string | null;
  expires_at: number | null;
  providerAccountId: string | null;
};

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

interface UserRelations {
  posts: PostObject[];
  likes: LikeObject[];
  following: FollowObject[];
  followers: FollowObject[];
}

export type UserObject = typeof usersTable.$inferSelect & UserRelations;
