"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type IMetadata,
  type PostObject,
  postPostStatus,
  PostsSortingColumn,
  PostsSortingColumnOptions,
  type Substring,
} from "~/models/post.model";
import { PostView } from "~/components/post-view";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { Sorter } from "~/components/sorter";
import type { User } from "next-auth";
import { PostCreator } from "~/components/post-creator";
import { Check, X } from "lucide-react";

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
  ) => Promise<postPostStatus>;
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

  const [status, setStatus] = useState(postPostStatus.Inactive);

  const handleSend = useCallback(
    async (
      input: string,
      urls: Substring[] | undefined,
      metadata: IMetadata | undefined,
    ) => {
      if (!send) return;

      setStatus(postPostStatus.Active);

      setStatus(await send(input, urls, metadata));

      setTimeout(() => {
        setStatus(postPostStatus.Inactive);
      }, 4000);
    },
    [send],
  );

  return (
    <>
      {sessionUser?.image && sessionUser?.name && send && (
        <PostCreator
          send={handleSend}
          sessionUser={sessionUser}
          disabled={status === postPostStatus.Active}
          setStatus={setStatus}
        />
      )}

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

      {treatedPosts.map((post) => (
        <PostView key={post.id} post={post} sessionUserId={sessionUser?.id} />
      ))}

      {status !== postPostStatus.Active &&
        status !== postPostStatus.Inactive && <StatusMessage status={status} />}
    </>
  );
}

function getTreatedPosts(
  posts: PostObject[],
  sortingColumn: PostsSortingColumn,
) {
  return posts.sort((postA, postB) => {
    const key = {
      [PostsSortingColumn.Likes]: (post: PostObject) => post.likes?.length ?? 0,
      [PostsSortingColumn.Replies]: (post: PostObject) => post.replies.length,
      [PostsSortingColumn.CreatedAt]: (post: PostObject) => post.createdAt,
    }[sortingColumn];

    const keyA = key(postA);
    const keyB = key(postB);

    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}

function StatusMessage({ status }: { status: postPostStatus }) {
  if (status === postPostStatus.Sucess)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-green-500 px-4 py-8 md:w-fit">
          <Check size={40} />
          Post Sent Sucessfully
        </div>
      </div>
    );

  return (
    <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
      <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-red-500 px-4 py-8 md:w-fit">
        <X size={40} />
        Internal Server Error
      </div>
    </div>
  );
}
