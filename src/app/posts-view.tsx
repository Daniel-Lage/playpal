"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type IMetadata,
  type PostObject,
  PostsSortingColumn,
  PostsSortingColumnOptions,
  type Substring,
} from "~/models/post.model";
import { PostView } from "~/components/post-view";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { Sorter } from "~/components/sorter";
import type { User } from "next-auth";
import { PostCreator } from "~/components/post-creator";

export function PostsView({
  posts: postsProp,
  sessionUser,
  lastQueried: lastQueriedProp,
  refresh,
  send,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUser?: User | undefined;
  refresh: (lastQueried: Date) => Promise<PostObject[]>;
  send?: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<void>;
}) {
  const [posts, setPosts] = useState(postsProp);

  useEffect(() => {
    setPosts(postsProp);
  }, [postsProp]);

  const lastQueried = useRef(lastQueriedProp);

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUser?.id ? `${sessionUser.id}:posts_reversed` : "posts_reversed",
    false,
    useCallback((text: string | null) => text === "true", []),
    useCallback(
      (value: boolean | null) => (value === true ? "true" : "false"),
      [],
    ),
  );

  const [sortingColumn, setSortingColumn] = useLocalStorage<PostsSortingColumn>(
    sessionUser?.id
      ? `${sessionUser.id}:posts_sorting_column`
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
      <div className="flex flex-col items-start gap-2 rounded-md bg-primary p-2 md:flex-row md:items-center md:justify-between">
        {posts.length} Posts
        <Sorter
          title="Sort by"
          onSelect={(value: string) =>
            setSortingColumn(value as PostsSortingColumn)
          }
          value={sortingColumn ?? PostsSortingColumn.CreatedAt}
          options={PostsSortingColumnOptions}
          reversed={reversed}
          reverse={() => {
            setReversed((prev) => !prev);
          }}
        />
      </div>

      {sessionUser?.image && sessionUser?.name && send && (
        <PostCreator send={send} sessionUser={sessionUser} />
      )}

      {treatedPosts.map((post) => (
        <PostView key={post.id} post={post} sessionUserId={sessionUser?.id} />
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
      [PostsSortingColumn.Likes]: (p: PostObject) => p.likes.length,
      [PostsSortingColumn.Replies]: (p: PostObject) => p.replies.length,
      [PostsSortingColumn.CreatedAt]: (p: PostObject) => p.createdAt,
    }[sortingColumn];

    if (key(postA) > key(postB)) return -1;
    if (key(postA) < key(postB)) return 1;
    return 0;
  });
}
