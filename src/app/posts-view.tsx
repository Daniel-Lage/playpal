"use client";

import { useEffect, useRef, useState } from "react";
import type { PostObject } from "~/models/post.model";
import { PostView } from "./_components/post-view";

export function PostsView({
  posts: postsProp,
  sessionUserId,
  lastQueried: lastQueriedProp,
  refresh,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUserId?: string | null | undefined;
  refresh: (lastQueried: Date) => Promise<PostObject[]>;
}) {
  const [posts, setPosts] = useState(postsProp);
  const lastQueried = useRef(lastQueriedProp);

  useEffect(() => {
    // every 10 seconds tries to get posts from the last 10 seconds
    const interval = setInterval(() => {
      refresh(lastQueried.current)
        .then((newPosts) => {
          setPosts((posts) => [...newPosts, ...posts]);
          lastQueried.current = new Date();
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [refresh]);

  return posts.map((post) => (
    <PostView key={post.id} post={post} sessionUserId={sessionUserId} />
  ));
}
