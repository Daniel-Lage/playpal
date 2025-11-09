"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabLinkButton } from "~/components/buttons/tab-link-button";

export function ProfileTabs({ userId }: { userId: string }) {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-3 gap-1 p-2 font-bold">
      <ProfileTabLink
        href={`/user/${userId}`}
        title="Main"
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/user/${userId}/replies`}
        title="Replies"
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/user/${userId}/likes`}
        title="Likes"
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
    <Link href={href} role="button" key={title}>
      <TabLinkButton
        className={href === pathname ? "bg-primary-accent" : "bg-primary"}
      >
        {title}
      </TabLinkButton>
    </Link>
  );
}
