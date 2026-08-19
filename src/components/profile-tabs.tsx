"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabLinkButton } from "~/components/buttons/tab-link-button";

export function ProfileTabs({ userId }: { userId: string }) {
  const pathname = usePathname();

  return (
    <div className="grid h-16 grid-cols-3 place-items-center gap-1 border-b bg-container p-2 px-2 font-bold">
      <ProfileTabLink
        href={`/users/${userId}`}
        title="Main"
        active={
          pathname === `/users/${userId}` ||
          pathname === `/users/${userId}/playlists`
        }
      />
      <ProfileTabLink
        href={`/users/${userId}/replies`}
        title="Replies"
        active={pathname === `/users/${userId}/replies`}
      />
      <ProfileTabLink
        href={`/users/${userId}/likes`}
        title="Likes"
        active={
          pathname === `/users/${userId}/likes` ||
          pathname === `/users/${userId}/likes/playlists`
        }
      />
    </div>
  );
}

function ProfileTabLink({
  href,
  title,
  active,
}: {
  href: string;
  title: string;
  active: boolean;
}) {
  return (
    <Link href={href} role="button" key={title} className="w-full">
      <TabLinkButton className={active ? "border" : ""}>{title}</TabLinkButton>
    </Link>
  );
}
