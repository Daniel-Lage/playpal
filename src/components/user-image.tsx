"use client";

import Image from "next/image";
import { useState } from "react";

export function UserImage({
  size,
  image,
  name,
}: {
  size: number;
  image: string | null | undefined;
  name: string | null | undefined;
}) {
  const [ready, setReady] = useState(false);

  return (
    <Image
      width={size}
      height={size}
      className="aspect-square rounded-full"
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
