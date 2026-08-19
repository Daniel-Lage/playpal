"use client";

import type { UserObject } from "~/models/user.model";
import { UserView } from "./user-view";
import { ItemsView } from "./items-view";
import { SearchView } from "./search-view";
import { useMemo, useState } from "react";

export function UserFeedView({
  users,
  sessionUserId,
}: {
  users: UserObject[];
  sessionUserId?: string | null;
}) {
  const [filter, setFilter] = useState("");

  const treatedUsers = useMemo(() => {
    const temp = [...users].filter(
      (user) =>
        !!user.name && user.name.toLowerCase().includes(filter.toLowerCase()),
    );

    return temp;
  }, [users, filter]);

  return (
    <>
      <div className="flex flex-col items-start gap-2 border-b bg-container p-2 md:flex-row md:items-center">
        <SearchView
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <ItemsView>
        {treatedUsers.map((user, index) => (
          <>
            {index !== 0 && (
              <div
                key={user.id + "divider"}
                className="mx-4 h-[1px] bg-border text-center"
              ></div>
            )}

            <UserView
              key={user.id + "view"}
              user={user}
              sessionUserId={sessionUserId}
            />
          </>
        ))}
      </ItemsView>
    </>
  );
}
