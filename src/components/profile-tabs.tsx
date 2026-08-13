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
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/users/${userId}/replies`}
        title="Replies"
        pathname={pathname}
      />
      <ProfileTabLink
        href={`/users/${userId}/likes`}
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
    <Link href={href} role="button" key={title} className="w-full">
      <TabLinkButton className={href === pathname ? "border" : ""}>
        {title}
      </TabLinkButton>
    </Link>
  );
}
