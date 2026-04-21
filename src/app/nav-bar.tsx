"use client";

import {
  Bell,
  House,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UserRoundPen,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavButton } from "~/components/buttons/nav-button";
import { UserImage } from "~/components/user-image";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { cn } from "~/lib/utils";
import type { SessionUser } from "~/models/user.model";

export function NavBar({ sessionUser }: { sessionUser?: SessionUser }) {
  const profileUrl = useMemo(
    () => (sessionUser ? `/user/${sessionUser.id}` : undefined),
    [sessionUser],
  );
  const pathname = usePathname();

  const scrollY = useRef(0);
  const [faded, setFaded] = useState(false);

  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    sessionUser?.id
      ? `${sessionUser.id}:nav_bar_collapsed`
      : "nav_bar_collapsed",
    false,
    useCallback((text: string | null) => text === "true", []),
    useCallback(
      (value: boolean | null) => (value === true ? "true" : "false"),
      [],
    ),
  );

  useEffect(() => {
    if (collapsed != null) {
      document.documentElement.style.setProperty(
        "--nav-bar-collapsed",
        collapsed ? "1" : "0",
      );
      document.documentElement.style.setProperty(
        "--nav-bar-expanded",
        collapsed ? "0" : "1",
      );
    }
  }, [collapsed]);

  useEffect(() => {
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
        className={cn(
          "fixed bottom-0 left-0 z-50 flex h-12 w-screen shrink-0 items-center justify-around border-r-2 border-background bg-primary p-6 font-bold transition-opacity md:h-svh md:w-[--nav-bar-w] md:flex-col md:items-end md:justify-normal md:gap-6",
          faded && "opacity-40 md:opacity-100",
        )}
      >
        <div className="hidden w-full md:flex md:flex-1">
          <NavButton
            onClick={() => setCollapsed((prev) => !prev)}
            collapsed={true}
            active={false}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </NavButton>
        </div>

        <div
          className={cn(
            "hidden md:block md:w-44",
            collapsed ? "md:w-12" : "md:w-44",
          )}
        >
          <Image
            width={48}
            height={48}
            className="aspect-square h-auto w-12 flex-shrink-0 flex-grow-0 rounded-md"
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
