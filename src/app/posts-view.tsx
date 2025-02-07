"use client";

import { useEffect, useRef, useState } from "react";
import type { PostObject } from "~/models/post.model";
import { Post } from "./_components/post";
import { getPosts } from "~/server/get-posts";

export function PostsView({
  posts: postsProp,
  sessionUserId,
  lastQueried: lastQueriedProp,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUserId?: string | null | undefined;
}) {
  const [posts, setPosts] = useState(postsProp);
  const lastQueried = useRef(lastQueriedProp);

  useEffect(() => {
    // every 10 seconds tries to get posts from the last 10 seconds
    setInterval(() => {
      getPosts(lastQueried.current)
        .then((newPosts) => {
          setPosts((posts) => [...newPosts, ...posts]);
          lastQueried.current = new Date();
        })
        .catch(console.error);
    }, 10000);
  }, []);

  return posts.map((post) => (
    <Post key={post.id} post={post} sessionUserId={sessionUserId} />
  ));
}
