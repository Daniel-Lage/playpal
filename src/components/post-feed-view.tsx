"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type IMetadata,
  type PostObject,
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import { PostView } from "~/components/post-view";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { Sorter } from "~/components/sorter";
import { PostCreator } from "~/components/post-creator";
import { ActionStatus } from "~/models/status.model";
import { ItemsView } from "~/components/items-view";
import { cn } from "~/lib/utils";
import type { SessionUser } from "~/models/user.model";
import { StatusMessage } from "./message-status";

export function PostFeedView({
  posts: postsProp,
  sessionUser,
  lastQueried: lastQueriedProp,
  refresh,
  send,
  isPrimaryColor = false,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUser?: SessionUser;
  isPrimaryColor?: boolean;
  refresh: (lastQueried: Date) => Promise<PostObject[]>;
  send?: (
    input: string,
    mentions: string[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
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
    useCallback((psc) => psc, []),
  );

  useEffect(() => {
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

  const [status, setStatus] = useState(ActionStatus.Inactive);

  const handleSend = useCallback(
    async (
      input: string,
      mentions: string[] | undefined,
      metadata: IMetadata | undefined,
    ) => {
      if (!send) return;

      setStatus(ActionStatus.Active);

      setStatus(await send(input, mentions, metadata));

      setTimeout(() => {
        setStatus(ActionStatus.Inactive);
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
          disabled={status === ActionStatus.Active}
          setStatus={setStatus}
          isPrimaryColor={isPrimaryColor}
        />
      )}

      <div
        className={cn(
          "flex flex-col items-start gap-2 bg-secondary p-2 px-2 md:flex-row md:items-center md:justify-between",
          isPrimaryColor
            ? "border-b-2 border-background bg-primary"
            : "bg-secondary",
        )}
      >
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
          isPrimaryColor={isPrimaryColor}
        />
      </div>

      <ItemsView>
        {treatedPosts.map((post) => (
          <PostView
            key={post.id}
            post={post}
            sessionUserId={sessionUser?.id}
            isPrimaryColor={isPrimaryColor}
          />
        ))}
      </ItemsView>

      <StatusMessage status={status} actionDone="Post Sent" />
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
