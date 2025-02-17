"use client";

import { signIn, signOut } from "next-auth/react";
import type { UserObject } from "~/models/user.model";
import { followUser } from "~/server/follow-user";
import { unfollowUser } from "~/server/unfollow-user";

export function FollowButton({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId: string | undefined;
}) {
  return !sessionUserId ? (
    <button onClick={() => signIn("spotify")} className="hover:underline">
      Follow
    </button>
  ) : user.id === sessionUserId ? (
    <button onClick={() => signOut()} className="hover:underline">
      Log Out
    </button>
  ) : user.followers.some((follow) => follow.followerId === sessionUserId) ? (
    <button
      onClick={() => unfollowUser(sessionUserId, user.id)}
      className="hover:underline"
    >
      Unfollow
    </button>
  ) : (
    <button
      onClick={() => followUser(sessionUserId, user.id)}
      className="hover:underline"
    >
      Follow
    </button>
  );
}
