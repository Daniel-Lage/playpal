"use client";

import type { UserObject } from "~/models/user.model";
import { UserView } from "./user-view";
import { ItemsView } from "./items-view";
import { SearchView } from "./search-view";
import { useMemo, useState } from "react";

export function UserFeedView({ users }: { users: UserObject[] }) {
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
      <div className="flex flex-col items-start gap-2 border-b-2 border-background bg-secondary p-2 md:flex-row md:items-center">
        <SearchView
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <ItemsView>
        {treatedUsers.map((user) => (
          <UserView key={user.id} user={user} />
        ))}
      </ItemsView>
    </>
  );
}
