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
      <Link
        href={"/"}
        role="button"
        className="flex w-full items-center justify-center"
        key={"Home"}
      >
        <Button
          size="nav"
          className={cn(pathname === "/" ? "bg-terciary-accent font-bold" : "")}
        >
          <StartNavIcon title={"Home"} active={pathname === "/"} />
          <div className="hidden text-lg md:block">{"Home"}</div>
        </Button>
      </Link>
      <Link
        href={profileURL ?? ""}
        role="button"
        className="flex w-full items-center justify-center"
      >
        <Button
          size="nav"
          onClick={() =>
            profileURL ?? signIn("spotify", { callbackUrl: "/user" })
          }
          className={cn(
            pathname === profileURL ? "bg-terciary-accent font-bold" : "",
          )}
        >
          <StartNavIcon title="Profile" active={pathname === profileURL} />
          <div className="hidden text-lg md:block">{"Profile"}</div>
        </Button>
      </Link>

      <Link
        href={"/search"}
        role="button"
        className="flex w-full items-center justify-center"
        key={"Search"}
      >
        <Button
          size="nav"
          className={cn(
            pathname === "/search" ? "bg-terciary-accent font-bold" : "",
          )}
        >
          <StartNavIcon title={"Search"} active={pathname === "/search"} />
          <div className="hidden text-lg md:block">{"Search"}</div>
        </Button>
      </Link>

      <Link
        href={"/notifications"}
        role="button"
        className="flex w-full items-center justify-center"
        key={"Notifications"}
      >
        <Button
          size="nav"
          className={cn(
            pathname === "/notifications" ? "bg-terciary-accent font-bold" : "",
          )}
        >
          <StartNavIcon
            title={"Notifications"}
            active={pathname === "/notifications"}
          />
          <div className="hidden text-lg md:block">{"Notifications"}</div>
        </Button>
      </Link>
    </div>
  );
}

function StartNavIcon({ title, active }: { title: string; active: boolean }) {
  if (title === "Profile") return <UserRound strokeWidth={active ? 3 : 2} />;
  if (title === "Home") return <House strokeWidth={active ? 3 : 2} />;
  if (title === "Search") return <Search strokeWidth={active ? 3 : 2} />;
  if (title === "Notifications") return <Bell strokeWidth={active ? 3 : 2} />;
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
