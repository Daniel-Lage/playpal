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

export function ProfileTabs({ profileId }: { profileId: string }) {
  const pathname = usePathname();

  return (
    <div className="bg-main-3 flex gap-1 font-bold">
      {profileTabs.map(({ title, path }) => (
        <ProfileTabLink
          href={`/profile/${profileId}${path}`}
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
      className={`bg-main-1 w-1/2 justify-center p-1 text-center text-xs hover:underline md:text-base`}
      role="button"
      key={title}
    >
      {title}
      {href === pathname && (
        <div className="bg-main-3 float-end h-1 w-full"></div>
      )}
    </Link>
  );
}
