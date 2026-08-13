"use client";

import { signIn } from "next-auth/react";
import { Heart } from "lucide-react";
import { useState } from "react";
import { IconButton } from "./icon-button";
import { cn } from "~/lib/utils";

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
    <div
      className={cn(
        "flex items-center gap-1 md:text-base",
        big ? "text-base" : "text-xs",
      )}
    >
      {!sessionUserId ? (
        <IconButton big={big} onClick={() => signIn()}>
          <Heart />
        </IconButton>
      ) : isLiked ? (
        <IconButton
          big={big}
          className="[&_svg]:fill-primary [&_svg]:stroke-primary"
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
      <a
        role="button"
        href={href}
        onClick={onClick}
        className="hover:underline"
      >
        {isLiked !== hasLike ? count + (isLiked ? 1 : -1) : count}
      </a>
    </div>
  );
}
