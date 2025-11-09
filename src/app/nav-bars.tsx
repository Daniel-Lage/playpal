"use client";

import {
  ArrowBigRight,
  Bell,
  House,
  LogIn,
  Search,
  UserRound,
} from "lucide-react";
import type { User } from "next-auth";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavButton } from "~/components/buttons/nav-button";
import { UserImage } from "~/components/user-image";
import { cn } from "~/lib/utils";

export function StartNav({ profileURL }: { profileURL?: string }) {
  const pathname = usePathname();

  const scrollY = useRef(0);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    window.onscroll = () => {
      if (window.scrollY - 10 > scrollY.current) {
        scrollY.current = window.scrollY;
        setFaded(true);
      }
      if (window.scrollY + 10 < scrollY.current) {
        scrollY.current = window.scrollY;
        setFaded(false);
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setFaded(false);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 flex h-12 w-screen min-w-56 shrink-0 gap-6 bg-terciary font-bold transition-opacity md:h-svh md:w-[19vw] md:flex-col md:p-10",
        faded && "opacity-40 md:opacity-100",
      )}
    >
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

      <StartNavButton title="Home" href="/" active={pathname === "/"} />

      <StartNavButton
        title="Profile"
        href={profileURL ?? ""}
        active={!!profileURL && pathname.startsWith(profileURL)}
      />

      <StartNavButton
        title="Search"
        href="/search"
        active={pathname === "/search"}
      />

      <StartNavButton
        title="Notifications"
        href="/notifications"
        active={pathname === "/notifications"}
      />
    </div>
  );
}

function StartNavButton({
  title,
  active,
  href,
}: {
  title: string;
  active: boolean;
  href: string;
  onClick?: () => void;
}) {
  const icons = new Map<string, JSX.Element>([
    ["Profile", <UserRound key="Profile" strokeWidth={active ? 3 : 2} />],
    ["Home", <House key="Home" strokeWidth={active ? 3 : 2} />],
    ["Search", <Search key="Search" strokeWidth={active ? 3 : 2} />],
    [
      "Notifications",
      <Bell key="Notifications" strokeWidth={active ? 3 : 2} />,
    ],
  ]);

  return (
    <Link
      href={href}
      role="button"
      className="flex w-full items-center justify-center"
    >
      <NavButton className={cn(active ? "bg-terciary-accent font-bold" : "")}>
        {icons.get(title)}
        <div className="hidden text-lg md:block">{title}</div>
      </NavButton>
    </Link>
  );
}

export function EndNav({ sessionUser }: { sessionUser: User | undefined }) {
  return (
    <div className="fixed right-0 top-0 flex h-12 w-screen shrink-0 flex-col justify-center gap-6 bg-terciary p-2 font-bold md:h-svh md:w-[19vw] md:justify-normal md:p-4">
      {sessionUser?.image ? (
        <Link
          href={`/user/${sessionUser.id}`}
          className="absolute self-center md:hidden"
        >
          <UserImage size={36} image={sessionUser?.image} name={"You"} />
        </Link>
      ) : (
        <NavButton onClick={() => signIn()} className="absolute md:relative">
          {sessionUser ? (
            <>
              <ArrowBigRight />
              <div className="hidden text-lg font-bold md:block">
                Finish Setting Up
              </div>
            </>
          ) : (
            <>
              <LogIn />
              <div className="hidden text-lg font-bold md:block">Sign In</div>
            </>
          )}
        </NavButton>
      )}
      <Image
        className="aspect-square h-9 w-9 shrink-0 grow-0 rounded-md md:hidden"
        width={36}
        height={36}
        src="/favicon.ico"
        alt="playpal logo"
        priority
      />
    </div>
  );
}
