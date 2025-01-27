"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  console.log(user, sessionUserId);

  if (user.followers.some((follow) => follow.followerId === sessionUserId))
    return (
      <button
        onClick={() =>
          sessionUserId
            ? unfollowUser(sessionUserId, user.id)
            : router.push("/api/auth/signin")
        }
      >
        Unfollow
      </button>
    );

  return (
    <button
      onClick={() =>
        sessionUserId
          ? followUser(sessionUserId, user.id)
          : router.push("/api/auth/signin")
      }
    >
      Follow
    </button>
  );
}
