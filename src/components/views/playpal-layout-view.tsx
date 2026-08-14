"use client";

import {
  Bell,
  House,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  UserRoundPen,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { NavButton } from "~/components/buttons/nav-button";
import { PlaypalLogo } from "~/components/playpal-logo";
import { UserImage } from "~/components/user-image";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { parseBooleanCookie } from "~/helpers/parse-cookie";
import { stringifyBooleanCookie } from "~/helpers/stringify-cookie";
import { useCookies } from "~/hooks/use-cookies";
import { cn } from "~/lib/utils";
import type { SessionUser } from "~/models/user.model";

export function PlayPalLayoutView({
  sessionUser,
  main,
  side,
  initialNavBarCollapsed,
  initialSideBarCollapsed,
}: {
  sessionUser?: SessionUser;
  main: React.ReactNode;
  side: React.ReactNode;
  initialNavBarCollapsed: boolean;
  initialSideBarCollapsed: boolean;
}) {
  const cookiePrefix = getCookiePrefix(sessionUser?.id);

  const profileUrl = useMemo(
    () => (sessionUser ? `/users/${sessionUser.id}` : undefined),
    [sessionUser],
  );
  const pathname = usePathname();

  const [navBarCollapsed, setNavBarCollapsed] = useCookies<boolean>(
    `${cookiePrefix}nav_bar_collapsed`,
    initialNavBarCollapsed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  const [sideBarCollapsed, setSideBarCollapsed] = useCookies<boolean>(
    `${cookiePrefix}side_bar_collapsed`,
    initialSideBarCollapsed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  const mainPageScrollTop = useRef(0);
  const [mainPageScrolled, setMainPageScrolled] = useState(false);

  const sideBarScrollTop = useRef(0);
  const [sideBarScrolled, setSideBarScrolled] = useState(false);

  return (
    <>
      <div
        className={cn(
          "absolute z-50 flex h-12 w-screen shrink-0 items-center justify-around border-t bg-sidebar p-6 font-bold transition-opacity md:relative md:h-svh md:flex-col md:items-end md:justify-normal md:gap-6 md:border-r md:border-t-0",
          navBarCollapsed
            ? "md:w-[--collapsed-bar-width]"
            : "md:w-[--expanded-nav-bar-width]",
          mainPageScrolled && "opacity-40 md:opacity-100",
        )}
      >
        <div className="hidden w-full md:flex md:flex-1">
          <NavButton
            onClick={() => setNavBarCollapsed((prev) => !prev)}
            collapsed={true}
            active={false}
          >
            {navBarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </NavButton>
        </div>

        <div
          className={cn(
            "hidden md:block md:w-44",
            navBarCollapsed ? "md:w-12" : "md:w-44",
          )}
        >
          <PlaypalLogo />
        </div>

        <NavButton
          href={"/"}
          collapsed={navBarCollapsed}
          active={pathname === "/"}
        >
          <House strokeWidth={pathname === "/" ? 4 : 3} />
          {!navBarCollapsed && <span className="hidden md:block">Home</span>}
        </NavButton>

        <NavButton
          href={"/search"}
          collapsed={navBarCollapsed}
          active={pathname === "/search"}
        >
          <Search strokeWidth={pathname === "/search" ? 4 : 3} />
          {!navBarCollapsed && <span className="hidden md:block">Search</span>}
        </NavButton>

        <NavButton
          href={"/notifications"}
          collapsed={navBarCollapsed}
          active={pathname === "/notifications"}
        >
          <Bell strokeWidth={pathname === "/notifications" ? 4 : 3} />
          {!navBarCollapsed && (
            <span className="hidden md:block">Notifications</span>
          )}
        </NavButton>

        <div className="hidden md:flex md:flex-1"></div>

        {!!profileUrl ? (
          sessionUser?.name ? (
            <NavButton
              href={pathname.startsWith(profileUrl) ? pathname : profileUrl}
              collapsed={navBarCollapsed}
              active={pathname.startsWith(profileUrl)}
            >
              <div className="relative flex w-6 items-center justify-center">
                <div
                  className={cn(
                    "absolute h-9 w-9 shrink-0",
                    navBarCollapsed ? "md:h-12 md:w-12" : "",
                  )}
                >
                  <UserImage
                    size={36}
                    className={navBarCollapsed ? "md:h-12 md:w-12" : ""}
                    image={sessionUser?.image}
                    name={"You"}
                  />
                </div>
              </div>
              {!navBarCollapsed && (
                <span className="hidden md:block">{sessionUser.name}</span>
              )}
            </NavButton>
          ) : (
            <NavButton
              href={"/setup"}
              collapsed={navBarCollapsed}
              active={pathname === "/setup"}
            >
              <UserRoundPen strokeWidth={pathname === "/setup" ? 4 : 3} />

              {!navBarCollapsed && (
                <span className="hidden md:block">Set Up</span>
              )}
            </NavButton>
          )
        ) : (
          <NavButton
            collapsed={navBarCollapsed}
            active={pathname === "/signin"}
            onClick={() => signIn()}
          >
            <LogIn strokeWidth={pathname === "/signin" ? 4 : 3} />

            {!navBarCollapsed && (
              <span className="hidden md:block">Sign In</span>
            )}
          </NavButton>
        )}
      </div>

      <div
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop - 10 > mainPageScrollTop.current) {
            mainPageScrollTop.current = target.scrollTop;
            setMainPageScrolled(true);
          }
          if (target.scrollTop === 0) {
            mainPageScrollTop.current = target.scrollTop;
            setMainPageScrolled(false);
          }
        }}
        className="h-full max-h-screen flex-1 overflow-y-scroll"
      >
        {main}
      </div>

      <div
        className={cn(
          "hidden h-full max-h-screen overflow-y-auto border-l bg-sidebar md:flex md:flex-col",
          sideBarCollapsed
            ? "md:w-[--collapsed-bar-width]"
            : "md:w-[--expanded-side-bar-width]",
        )}
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop - 10 > sideBarScrollTop.current) {
            sideBarScrollTop.current = target.scrollTop;
            setSideBarScrolled(true);
          }
          if (target.scrollTop === 0) {
            sideBarScrollTop.current = target.scrollTop;
            setSideBarScrolled(false);
          }
        }}
      >
        <div
          className={cn(
            "absolute right-0 hidden justify-end p-6 md:flex",
            sideBarCollapsed
              ? "md:w-[--collapsed-bar-width]"
              : "md:w-[--expanded-side-bar-width]",
            sideBarScrolled ? "border-b border-l bg-container" : "",
          )}
        >
          <NavButton
            onClick={() => setSideBarCollapsed((prev) => !prev)}
            collapsed={true}
            active={false}
          >
            {sideBarCollapsed ? <PanelRightOpen /> : <PanelRightClose />}
          </NavButton>
        </div>
        {sideBarCollapsed ? null : side}
      </div>
    </>
  );
}
