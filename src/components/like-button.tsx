"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function LikeButton({
  hasLike,
  sessionUserId,
  count,
  href,
  onClick,
  like,
  unlike,
}: {
  hasLike: boolean;
  count: number;
  href?: string;
  onClick?: () => void;
  like: (suid: string) => Promise<void>;
  unlike: (suid: string) => Promise<void>;
  sessionUserId?: string | null;
}) {
  const [isLiked, setIsLiked] = useState(hasLike);

  return (
    <div className="flex items-center gap-2">
      {!sessionUserId ? (
        <Button size="icon" onClick={() => signIn("spotify")}>
          <Heart />
        </Button>
      ) : isLiked ? (
        <Button
          size="icon"
          onClick={() => {
            setIsLiked(false);
            unlike(sessionUserId).catch(() => setIsLiked(true));
          }}
        >
          <Heart fill="red" color="red" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={() => {
            setIsLiked(true);
            like(sessionUserId).catch(() => setIsLiked(false));
          }}
        >
          <Heart />
        </Button>
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
