"use client";

import { signIn } from "next-auth/react";
import type { MainPostObject, PostObject } from "~/models/post.model";
import { likePost } from "~/server/like-post";
import { unlikePost } from "~/server/unlike-post";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";

export function LikeButton({
  post,
  sessionUserId,
  isLiked,
  setIsLiked,
}: {
  post: MainPostObject | PostObject;
  sessionUserId?: string | null;
  isLiked: boolean | undefined;
  setIsLiked: (newValue: boolean) => void;
}) {
  return !sessionUserId ? (
    <Button size="icon" onClick={() => signIn("spotify")}>
      <Heart />
    </Button>
  ) : isLiked ? (
    <Button
      size="icon"
      onClick={() => {
        setIsLiked(false);
        unlikePost(post.id, sessionUserId)
          .then(() => {
            // on success
          })
          .catch(() => {
            // on error
            setIsLiked(true);
          });
      }}
    >
      <Heart fill="red" color="red" />
    </Button>
  ) : (
    <Button
      size="icon"
      onClick={() => {
        setIsLiked(true);
        likePost(post.id, sessionUserId)
          .then(() => {
            // on success
          })
          .catch(() => {
            // on error
            setIsLiked(false);
          });
      }}
    >
      <Heart />
    </Button>
  );
}
