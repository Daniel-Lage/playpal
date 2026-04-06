"use client";

import { signIn } from "next-auth/react";
import { Heart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { IconButton } from "./icon-button";

export function LikeButton({
  hasLike,
  sessionUserId,
  count,
  href,
  onClick,
  like,
  unlike,
  big,
}: {
  hasLike: boolean;
  count: number;
  href?: string;
  onClick?: () => void;
  like: (suid: string) => Promise<void>;
  unlike: (suid: string) => Promise<void>;
  sessionUserId?: string | null;
  big?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(hasLike);

  return (
    <div className="flex items-center gap-2">
      {!sessionUserId ? (
        <IconButton big={big} onClick={() => signIn()}>
          <Heart />
        </IconButton>
      ) : isLiked ? (
        <IconButton
          big={big}
          className="[&_svg]:fill-primary-accent [&_svg]:stroke-primary-accent"
          onClick={() => {
            setIsLiked(false);
            unlike(sessionUserId).catch(() => setIsLiked(true));
          }}
        >
          <Heart />
        </IconButton>
      ) : (
        <IconButton
          big={big}
          onClick={() => {
            setIsLiked(true);
            like(sessionUserId).catch(() => setIsLiked(false));
          }}
        >
          <Heart />
        </IconButton>
      )}
      {href ? (
        <Link href={href} className="hover:underline">
          {isLiked !== hasLike ? count + (isLiked ? 1 : -1) : count}
        </Link>
      ) : (
        <button className="hover:underline" onClick={onClick}>
          {isLiked !== hasLike ? count + (isLiked ? 1 : -1) : count}
        </button>
      )}
    </div>
  );
}
