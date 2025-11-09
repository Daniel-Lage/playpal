"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
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
      <Button
        onClick={() => unfollowUser(sessionUserId, user.id)}
        variant="link"
        size="default"
      >
        Unfollow
      </Button>
    );

  return (
    <Button
      variant="login"
      size="default"
      onClick={() =>
        sessionUserId ? followUser(sessionUserId, user.id) : signIn()
      }
    >
      Follow
    </Button>
  );
}
