"use client";

import { MessageSquare } from "lucide-react";
import { IconButton } from "./icon-button";
import { cn } from "~/lib/utils";
import Link from "next/link";

export function RepliesButton({
  count,
  href,
  big,
}: {
  count: number;
  href: string;
  big?: boolean;
}) {
  return (
    <Link
      className={cn(
        "flex items-center justify-center gap-1 text-xs hover:underline md:gap-2 md:text-base",
        big ? "text-base" : "text-xs",
      )}
      href={href}
    >
      <IconButton big={big}>
        <MessageSquare />
      </IconButton>
      {count}
    </Link>
  );
}
