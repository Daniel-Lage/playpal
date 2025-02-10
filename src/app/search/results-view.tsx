"use client";

import type { PostObject } from "~/models/post.model";
import type { UserObject } from "~/models/user.model";
import { PostView } from "../_components/post-view";
import { UserView } from "../_components/user-view";
import { useEffect, useRef, useState } from "react";

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
  return (
    <>
      <div className="rounded-md bg-secondary-1">
        <div className="p-2 font-bold">Users</div>

        <div className="flex gap-2 bg-secondary-2 p-2">
          {users.map((user) => (
            <UserView key={user.id} user={user} />
          ))}
        </div>
      </div>
      {posts.map((post) => (
        <PostView key={post.id} post={post} sessionUserId={sessionUserId} />
      ))}
    </>
  );
}
