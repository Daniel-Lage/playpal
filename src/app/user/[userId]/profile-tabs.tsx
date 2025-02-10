"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LinkParams } from "~/models/link.model";

const profileTabs: LinkParams[] = [
  { title: "Posts", path: "" },
  { title: "Posts and Replies", path: "/with_replies" },
  { title: "Likes", path: "/likes" },
  { title: "Playlists", path: "/playlists" },
];

export function ProfileTabs({ userId }: { userId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 bg-main-3 font-bold">
      {profileTabs.map(({ title, path }) => (
        <ProfileTabLink
          href={`/user/${userId}${path}`}
          key={title}
          title={title}
          pathname={pathname}
        />
      ))}
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
      className={`w-1/2 justify-center ${href === pathname ? "bg-main-3" : "bg-main-1"} p-1 text-center text-xs hover:underline md:text-base`}
      role="button"
      key={title}
    >
      {title}
    </Link>
  );
}
