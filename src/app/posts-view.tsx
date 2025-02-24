"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type PostObject,
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import { PostView } from "./_components/post-view";
import Image from "next/image";
import { useLocalStorage } from "~/hooks/use-local-storage";

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

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUserId ? `${sessionUserId}:posts_reversed` : "posts_reversed",
    false,
    useCallback((text: string | null) => text === "true", []),
    useCallback(
      (value: boolean | null) => (value === true ? "true" : "false"),
      [],
    ),
  );

  const [sortingColumn, setSortingColumn] = useLocalStorage<PostsSortingColumn>(
    sessionUserId
      ? `${sessionUserId}:posts_sorting_column`
      : "posts_sorting_column",
    PostsSortingColumn.CreatedAt,
    useCallback((text) => {
      if (PostsSortingColumnOptions.some((psco) => psco === text))
        return text as PostsSortingColumn;
      return null;
    }, []),
    useCallback((psc) => psc, []), // already is text so no conversion is needed
  );

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

  const treatedPosts = useMemo(() => {
    const temp = getTreatedPosts([...posts], sortingColumn);

    if (reversed) return temp.reverse();

    return temp;
  }, [posts, sortingColumn, reversed]);

  return (
    <>
      <div className="flex flex-col items-start gap-2 rounded-md bg-main-1 p-2 md:flex-row md:items-center">
        {posts.length} Posts
        <div className="flex items-center justify-center gap-2 rounded-md bg-main-3 p-2 text-center text-sm">
          <div className="font-bold">Sorting column</div>
          <select
            onChange={(e) => {
              setSortingColumn(e.target.value as PostsSortingColumn);
            }}
            defaultValue={sortingColumn ?? PostsSortingColumn.CreatedAt}
          >
            {PostsSortingColumnOptions.map((sortingColumn) => (
              <option key={sortingColumn}>{sortingColumn}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setReversed((prev) => !prev);
            }}
            className="my-[-10px]"
          >
            <Image
              height={32}
              width={32}
              src="/direction.png"
              alt="direction icon"
              className={reversed ? "rotate-180" : ""}
            />
          </button>
        </div>
      </div>
      {treatedPosts.map((post) => (
        <PostView key={post.id} post={post} sessionUserId={sessionUserId} />
      ))}
    </>
  );
}

function getTreatedPosts(
  posts: PostObject[],
  sortingColumn: PostsSortingColumn,
) {
  return posts.sort((postA, postB) => {
    const key = {
      [PostsSortingColumn.Likes]: (p: PostObject) => -p.likes.length,
      [PostsSortingColumn.Replies]: (p: PostObject) => -p.replies.length,
      [PostsSortingColumn.CreatedAt]: (p: PostObject) => -p.createdAt.getTime(),
    }[sortingColumn];

    if (key(postA) < key(postB)) return -1;
    if (key(postA) > key(postB)) return 1;
    return 0;
  });
}
