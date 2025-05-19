"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

export function ProfileTabs({ userId }: { userId: string }) {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-4 gap-1 p-2 font-bold">
      <ProfileTabLink
        href={`/user/${userId}`}
        title="Posts"
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/user/${userId}/with_replies`}
        title="Posts and Replies"
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/user/${userId}/likes`}
        title="Likes"
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/user/${userId}/playlists`}
        title="Playlists"
        pathname={pathname}
      />
    </div>
  );
}

function ProfileTabLink({
  href,
  title,
  pathname,
}: {
  href: string;
  title: string;
  pathname: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "justify-center rounded-md p-1 text-center text-xs hover:underline md:text-base",
        href === pathname ? "bg-primary-accent" : "bg-primary",
      )}
      role="button"
      key={title}
    >
      {title}
    </Link>
  );
}
