"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NavButton } from "./buttons/nav-button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import { useLocalStorage } from "~/hooks/use-local-storage";
import type { User } from "next-auth";

export function PageView({
  children,
  sideContent,
  sessionUser,
}: {
  children: React.ReactNode;
  sideContent?: React.ReactNode;
  sessionUser?: User | undefined;
}) {
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    sessionUser?.id
      ? `${sessionUser.id}:side_bar_collapsed`
      : "side_bar_collapsed",
    false,
    useCallback((text: string | null) => text === "true", []),
    useCallback(
      (value: boolean | null) => (value === true ? "true" : "false"),
      [],
    ),
  );

  const scrollTop = useRef(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (collapsed != null) {
      document.documentElement.style.setProperty(
        "--side-bar-collapsed",
        collapsed ? "1" : "0",
      );
      document.documentElement.style.setProperty(
        "--side-bar-expanded",
        collapsed ? "0" : "1",
      );
    }
  }, [collapsed]);

  return (
    <>
      <div className="md:pl-[calc(var(--nav-bar-w))] md:pr-[calc(var(--side-bar-w))]">
        {children}
      </div>
      <div
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
        className={cn(
          "fixed right-0 top-0 hidden h-screen overflow-y-auto border-l-2 border-background bg-primary pt-12 md:flex md:flex-col",
          collapsed ? "w-[96px]" : "w-[--side-bar-w]",
        )}
      >
        <div
          className={cn(
            "fixed right-0 top-0 hidden justify-end p-6 md:flex",
            collapsed ? "w-[96px]" : "w-[--side-bar-w]",
            scrolled ? "border-b-2 border-background bg-primary" : "",
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
