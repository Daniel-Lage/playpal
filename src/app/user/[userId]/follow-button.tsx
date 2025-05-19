"use client";

import { signIn } from "next-auth/react";
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
  if (user.id === sessionUserId) return null;

  if (
    sessionUserId &&
    user.followers.some((follow) => follow.followerId === sessionUserId)
  )
    return (
      <button
        onClick={() => unfollowUser(sessionUserId, user.id)}
        className="hover:underline"
      >
        Unfollow
      </button>
    );

  return (
    <button
      onClick={() =>
        sessionUserId ? followUser(sessionUserId, user.id) : signIn("spotify")
      }
      className="hover:underline"
    >
      Follow
    </button>
  );
}
