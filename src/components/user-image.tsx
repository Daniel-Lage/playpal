"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "~/lib/utils";

export function UserImage({
  size,
  image,
  name,
  className,
}: {
  size: number;
  className?: string;
  image: string | null | undefined;
  name: string | null | undefined;
}) {
  const [ready, setReady] = useState(false);

  return (
    <Image
      width={size}
      height={size}
      className={cn("aspect-square rounded-full", className)}
      src={ready ? (image ?? "/avatar.svg") : "/avatar.svg"}
      alt={image ? (name ?? "") : ""}
      onLoad={() => {
        setReady(true);
      }}
      onError={() => {
        setReady(false);
      }}
    />
  );
}
