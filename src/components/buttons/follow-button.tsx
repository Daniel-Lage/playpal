"use client";

import { signIn } from "next-auth/react";
import { LinkButton } from "~/components/buttons/link-button";
import { cn } from "~/lib/utils";
import type { UserObject } from "~/models/user.model";
import { followUser } from "~/server/follow-user";
import { unfollowUser } from "~/server/unfollow-user";

export function FollowButton({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId?: string | null;
}) {
  if (user.id === sessionUserId) return null;

  const className = "self-end px-3 py-2 rounded-full text-sm";

  if (
    sessionUserId &&
    user.followers.some((follow) => follow.followerId === sessionUserId)
  )
    return (
      <LinkButton
        className={cn("border", className)}
        onClick={() => unfollowUser(sessionUserId, user.id)}
      >
        Unfollow
      </LinkButton>
    );

  return (
    <LinkButton
      className={cn("bg-primary text-primary-foreground", className)}
      onClick={() =>
        sessionUserId ? followUser(sessionUserId, user.id) : signIn()
      }
    >
      Follow
    </LinkButton>
  );
}
