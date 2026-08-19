"use client";

import type { UserObject } from "~/models/user.model";
import { UserView } from "./views/user-view";
import { useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export function WhoToFollowCard({
  users,
  sessionUserId,
}: {
  users: UserObject[];
  sessionUserId: string | undefined;
}) {
  const [showAll, setShowAll] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex h-72 max-w-[16vw] flex-col overflow-hidden rounded-2xl border",
      )}
    >
      <div className="absolute top-0 flex h-12 w-full items-center justify-center bg-gradient-to-b from-sidebar via-sidebar to-transparent font-bold">
        <div>Who to Follow</div>
      </div>
      <div
        className={cn("flex flex-col pt-8", showAll && "overflow-scroll")}
        ref={cardRef}
      >
        {users?.map((user) => (
          <UserView user={user} key={user.id} sessionUserId={sessionUserId} />
        ))}
        <button
          className="relative self-center text-left font-bold text-primary"
          onClick={() => {
            cardRef.current?.scrollTo({ top: 0 });
            setShowAll(false);
          }}
        >
          <ChevronUp />
        </button>
      </div>
      {users.length > 4 && !showAll && (
        <div className="absolute bottom-0 flex h-16 w-full items-end justify-center bg-gradient-to-t from-sidebar to-transparent">
          <button
            className="relative text-left font-bold text-primary"
            onClick={() => {
              setShowAll(true);
            }}
          >
            <ChevronDown />
          </button>
        </div>
      )}
    </div>
  );
}
