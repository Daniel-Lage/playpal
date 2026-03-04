"use client";

import { Bell, House, LogIn, Search, UserRoundPen } from "lucide-react";
import type { User } from "next-auth";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavButton } from "~/components/buttons/nav-button";
import { UserImage } from "~/components/user-image";
import { cn } from "~/lib/utils";

export function StartNav({ sessionUser }: { sessionUser?: User | undefined }) {
  const profileUrl = useMemo(
    () => (sessionUser ? `/user/${sessionUser.id}` : undefined),
    [sessionUser],
  );

  const pathname = usePathname();

  const scrollY = useRef(0);
  const [faded, setFaded] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>();

  useEffect(() => {
    if (collapsed != undefined) {
      localStorage.setItem("start-nav-collapsed", collapsed ? "1" : "0");
      document.documentElement.style.setProperty(
        "--start-nav-collapsed",
        collapsed ? "1" : "0",
      );
      document.documentElement.style.setProperty(
        "--start-nav-expanded",
        collapsed ? "0" : "1",
      );
    }
  }, [collapsed]);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("start-nav-collapsed") === "1");
    window.addEventListener("scroll", () => {
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
    });
  }, []);

  return (
    <>
      <div
        onClick={() => setCollapsed((prev) => !prev)}
        className={cn(
          "fixed bottom-0 left-[calc(var(--start-nav-w)_-_8px)] z-20 hidden h-svh w-4 cursor-pointer md:block",
        )}
      ></div>
      <div
        className={cn(
          "fixed bottom-0 left-0 z-10 flex h-12 w-screen shrink-0 items-center justify-around bg-terciary px-6 font-bold transition-opacity md:h-svh md:w-[--start-nav-w] md:flex-col md:justify-normal md:gap-6",
          faded && "opacity-40 md:opacity-100",
          collapsed ? "md:py-6" : "md:p-6 md:pl-24",
        )}
      >
        <div className="hidden md:flex md:flex-1"></div>

        <div
          className={cn(
            "hidden md:block",
            collapsed ? "self-center" : "self-start",
          )}
        >
          <Image
            className="rounded-md"
            width={48}
            height={48}
            src="/favicon.ico"
            alt="playpal logo"
            priority
          />
        </div>

        <NavButton href={"/"} collapsed={collapsed} active={pathname === "/"}>
          <House strokeWidth={pathname === "/" ? 4 : 3} />
          {!collapsed && <span className="hidden md:block">Home</span>}
        </NavButton>

        <NavButton
          href={"/search"}
          collapsed={collapsed}
          active={pathname === "/search"}
        >
          <Search strokeWidth={pathname === "/search" ? 4 : 3} />
          {!collapsed && <span className="hidden md:block">Search</span>}
        </NavButton>

        <NavButton
          href={"/notifications"}
          collapsed={collapsed}
          active={pathname === "/notifications"}
        >
          <Bell strokeWidth={pathname === "/notifications" ? 4 : 3} />
          {!collapsed && <span className="hidden md:block">Notifications</span>}
        </NavButton>

        <div className="hidden md:flex md:flex-1"></div>

        {!!profileUrl ? (
          sessionUser?.name ? (
            <NavButton
              href={pathname.startsWith(profileUrl) ? pathname : profileUrl}
              collapsed={collapsed}
              active={pathname.startsWith(profileUrl)}
            >
              <div className="relative flex w-6 items-center justify-center">
                <div
                  className={cn(
                    "absolute h-9 w-9 shrink-0",
                    collapsed ? "md:h-12 md:w-12" : "",
                  )}
                >
                  <UserImage
                    size={36}
                    className={collapsed ? "md:h-12 md:w-12" : ""}
                    image={sessionUser?.image}
                    name={"You"}
                  />
                </div>
              </div>
              {!collapsed && (
                <span className="hidden md:block">{sessionUser.name}</span>
              )}
            </NavButton>
          ) : (
            <NavButton
              href={"/setup"}
              collapsed={collapsed}
              active={pathname === "/setup"}
            >
              <UserRoundPen strokeWidth={pathname === "/setup" ? 4 : 3} />

              {!collapsed && <span className="hidden md:block">Set Up</span>}
            </NavButton>
          )
        ) : (
          <NavButton
            collapsed={collapsed}
            active={pathname === "/signin"}
            onClick={() => signIn()}
          >
            <LogIn strokeWidth={pathname === "/signin" ? 4 : 3} />

            {!collapsed && <span className="hidden md:block">Sign In</span>}
          </NavButton>
        )}
      </div>
    </>
  );
}
