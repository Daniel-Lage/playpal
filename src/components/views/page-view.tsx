"use client";

import { useRef, useState } from "react";
import { NavButton } from "../buttons/nav-button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import { useCookies } from "~/hooks/use-cookies";
import type { SessionUser } from "~/models/user.model";

function parseSideBarCollapsedCookie(text: string | null): boolean {
  return text === "true";
}

function stringifySideBarCollapsedCookie(value: boolean | null): string {
  return value === true ? "true" : "false";
}

export function PageView({
  children,
  sideContent,
  sessionUser,
  initialCollapsed,
}: {
  children: React.ReactNode;
  sideContent?: React.ReactNode;
  sessionUser?: SessionUser;

  initialCollapsed: boolean;
}) {
  const cookiePrefix = sessionUser ? `playpal.${sessionUser.id}:` : "playpal.";

  const [collapsed, setCollapsed] = useCookies<boolean>(
    `${cookiePrefix}side_bar_collapsed`,
    initialCollapsed,
    parseSideBarCollapsedCookie,
    stringifySideBarCollapsedCookie,
  );

  const scrollTop = useRef(0);
  const [scrolled, setScrolled] = useState(false);

  return (
    <>
      <div className="h-full max-h-screen flex-1 overflow-y-scroll">
        {children}
      </div>
      <div
        className={cn(
          "hidden h-full max-h-screen overflow-y-auto border-l bg-sidebar md:flex md:flex-col",
          collapsed
            ? "md:w-[--collapsed-bar-width]"
            : "md:w-[--expanded-side-bar-width]",
        )}
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop - 10 > scrollTop.current) {
            scrollTop.current = target.scrollTop;
            setScrolled(true);
          }
          if (target.scrollTop === 0) {
            scrollTop.current = target.scrollTop;
            setScrolled(false);
          }
        }}
      >
        <div
          className={cn(
            "absolute right-0 hidden justify-end p-6 md:flex",
            collapsed
              ? "md:w-[--collapsed-bar-width]"
              : "md:w-[--expanded-side-bar-width]",
            scrolled ? "border-b border-l bg-container" : "",
          )}
        >
          <NavButton
            onClick={() => setCollapsed((prev) => !prev)}
            collapsed={true}
            active={false}
          >
            {collapsed ? <PanelRightOpen /> : <PanelRightClose />}
          </NavButton>
        </div>
        {collapsed ? null : sideContent}
      </div>
    </>
  );
}
