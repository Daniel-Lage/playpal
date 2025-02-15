"use client";

import Link from "next/link";
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
    <Link href={"/api/auth/signin"} className="hover:underline">
      Follow
    </Link>
  ) : user.id === sessionUserId ? (
    <Link href={"/api/auth/signout"} className="hover:underline">
      Log Out
    </Link>
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
