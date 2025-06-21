"use client";

import { Bell, House, LogIn, Search, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function StartNav({ profileURL }: { profileURL?: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-16 w-screen min-w-56 shrink-0 gap-6 bg-terciary font-bold md:h-svh md:w-[19vw] md:flex-col md:p-10">
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
      key="Notifications"
    >
      <Button
        size="nav"
        className={cn(active ? "bg-terciary-accent font-bold" : "")}
      >
        {icons.get(title)}
        <div className="hidden text-lg md:block">{title}</div>
      </Button>
    </Link>
  );
}

export function EndNav({
  sessionUserImage,
}: {
  sessionUserImage: string | null | undefined;
}) {
  return (
    <div className="flex h-14 w-screen shrink-0 flex-col justify-center gap-6 bg-terciary p-2 font-bold md:h-svh md:w-[19vw] md:justify-normal md:p-4">
      {sessionUserImage && (
        <Image
          className="absolute aspect-square self-center rounded-full md:hidden"
          height={40}
          width={40}
          src={sessionUserImage}
          alt="your image"
        />
      )}
      <Image
        className="aspect-square shrink-0 rounded-md md:hidden"
        width={40}
        height={40}
        src="/favicon.ico"
        alt="playpal logo"
        priority
      />
      {!sessionUserImage && (
        <Button onClick={() => signIn("spotify")} size="nav" variant="login">
          <LogIn />
          <div className="hidden text-lg font-bold md:block">Sign In</div>
        </Button>
      )}
    </div>
  );
}
