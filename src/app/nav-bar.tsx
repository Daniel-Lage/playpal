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
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { NavButton } from "~/components/buttons/nav-button";
import { PlaypalLogo } from "~/components/playpal-logo";
import { UserImage } from "~/components/user-image";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { parseBooleanCookie } from "~/helpers/parse-cookie";
import { stringifyBooleanCookie } from "~/helpers/stringify-cookie";
import { useCookies } from "~/hooks/use-cookies";
import { cn } from "~/lib/utils";
import type { SessionUser } from "~/models/user.model";

export function NavBar({
  sessionUser,
  initialCollapsed = false,
}: {
  sessionUser?: SessionUser;

  initialCollapsed: boolean;
}) {
  const cookiePrefix = getCookiePrefix(sessionUser?.id);

  const profileUrl = useMemo(
    () => (sessionUser ? `/users/${sessionUser.id}` : undefined),
    [sessionUser],
  );
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useCookies<boolean>(
    `${cookiePrefix}nav_bar_collapsed`,
    initialCollapsed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  return (
    <>
      <div
        className={cn(
          "z-50 flex h-12 w-screen shrink-0 items-center justify-around border-t bg-sidebar p-6 font-bold transition-opacity md:h-svh md:flex-col md:items-end md:justify-normal md:gap-6 md:border-r md:border-t-0",
          collapsed
            ? "md:w-[--collapsed-side-bar-width]"
            : "md:w-[--expanded-side-bar-width]",
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
          <PlaypalLogo />
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
