"use client";

import { signIn } from "next-auth/react";
import { LinkButton } from "~/components/buttons/link-button";
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
      <LinkButton
        className="self-end"
        onClick={() => unfollowUser(sessionUserId, user.id)}
      >
        Unfollow
      </LinkButton>
    );

  return (
    <LinkButton
      className="self-end"
      onClick={() =>
        sessionUserId ? followUser(sessionUserId, user.id) : signIn()
      }
    >
      Follow
    </LinkButton>
  );
}
