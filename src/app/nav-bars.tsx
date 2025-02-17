"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { LinkParams } from "~/models/link.model";

export function StartNav({ profileURL }: { profileURL?: string }) {
  const navTabs: LinkParams[] = [
    { title: "Profile", path: profileURL, icon: "/profile.png" },
    { title: "Home", path: "/", icon: "/home.png" },
    { title: "Search", path: "/search", icon: "/search.png" },
  ];

  return (
    <div className="flex h-16 w-screen shrink-0 gap-6 bg-nav font-bold md:h-screen md:w-[19vw] md:flex-col md:pl-10 md:pt-4">
      <div className="absolute w-0 md:relative md:w-auto">
        <Image
          className="rounded-md"
          width={48}
          height={48}
          src="/favicon.ico"
          alt="playpal logo"
          priority
        />
      </div>
      {navTabs.map(({ title, path, icon }) => (
        <div
          className="flex w-full items-center justify-center md:justify-start"
          key={title}
        >
          {path ? (
            <Link href={path} className="flex items-end gap-2" role="button">
              <Image height={32} width={32} src={icon ?? ""} alt={icon ?? ""} />
              <div className="hidden md:block">{title}</div>
            </Link>
          ) : (
            <button
              onClick={() => signIn("spotify", { callbackUrl: "/user" })}
              className="flex items-end gap-2"
              role="button"
            >
              <Image height={32} width={32} src={icon ?? ""} alt={icon ?? ""} />
              <div className="hidden md:block">{title}</div>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function EndNav({
  sessionUserImage,
}: {
  sessionUserImage: string | null | undefined;
}) {
  return (
    <div className="flex h-14 w-screen shrink-0 flex-col justify-center gap-6 bg-nav p-2 font-bold md:h-screen md:w-[19vw] md:justify-normal md:p-4">
      <div className="absolute w-auto self-start md:absolute md:w-0">
        <Image
          className="aspect-square rounded-md"
          width={40}
          height={40}
          src="/favicon.ico"
          alt="playpal logo"
          priority
        />
      </div>
      {sessionUserImage ? (
        <Image
          className="aspect-square self-center rounded-full md:hidden"
          height={40}
          width={40}
          src={sessionUserImage}
          alt="your image"
        />
      ) : (
        <button
          onClick={() => signIn("spotify")}
          className="flex items-center justify-center gap-2 self-center rounded-full bg-main-3 p-2 md:w-full md:justify-start"
        >
          <Image height={32} width={32} src="/enter.png" alt="enter icon" />
          <div className="hidden grow md:ml-[-18px] md:block">Sign In</div>
        </button>
      )}
    </div>
  );
}
