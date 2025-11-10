"use client";

import type { PostObject } from "~/models/post.model";
import type { UserObject } from "~/models/user.model";
import { PostView } from "~/components/post-view";
import { UserView } from "~/components/user-view";
import { useEffect, useRef, useState } from "react";
import { MainContentView } from "~/components/main-content-view";

export function ResultsView({
  users: usersProp,
  posts: postsProp,
  sessionUserId,
  lastQueried: lastQueriedProp,
  refresh,
}: {
  users: UserObject[];
  posts: PostObject[];
  lastQueried: Date;
  refresh: (
    lastQueried: Date,
  ) => Promise<{ users: UserObject[]; posts: PostObject[] }>;
  sessionUserId?: string | null | undefined;
}) {
  const [users, setUsers] = useState(usersProp);
  const [posts, setPosts] = useState(postsProp);
  const lastQueried = useRef(lastQueriedProp);

  useEffect(() => {
    // every 10 seconds tries to get results from the last 10 seconds
    const interval = setInterval(() => {
      refresh(lastQueried.current)
        .then(({ users: newUsers, posts: newPosts }) => {
          setPosts((posts) => [...newPosts, ...posts]);
          setUsers((users) => [...newUsers, ...users]);
          lastQueried.current = new Date();
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [refresh]);

  if (users.length === 0 && posts.length === 0)
    return (
      <MainContentView>
        <span className="text-xl text-secondary">No results found</span>
      </MainContentView>
    );

  return (
    <MainContentView>
      {users.length !== 0 && (
        <div className="flex flex-col overflow-hidden rounded-md bg-secondary">
          <div className="w-full border-b-2 border-background p-2 font-bold">
            Users
          </div>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
            {users.map((user) => (
              <UserView key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}
      {posts.map((post) => (
        <PostView key={post.id} post={post} sessionUserId={sessionUserId} />
      ))}
    </MainContentView>
  );
}
