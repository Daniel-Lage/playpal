"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type IMetadata,
  type PostObject,
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import { PostView } from "~/components/views/post-view";
import { useCookies } from "~/hooks/use-cookies";
import { Sorter } from "~/components/sorter";
import { PostCreator } from "~/components/post-creator";
import { ActionStatus } from "~/models/status.model";
import { ItemsView } from "~/components/views/items-view";
import { cn } from "~/lib/utils";
import type { SessionUser } from "~/models/user.model";
import { StatusMessage } from "../message-status";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import {
  stringifyBooleanCookie,
  stringifyPostsSortingColumnCookie,
} from "~/helpers/stringify-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";

export function PostFeedView({
  posts: postsProp,
  sessionUser,
  lastQueried: lastQueriedProp,
  refresh,
  send,
  initialReversed,
  initialSortingColumn,
}: {
  posts: PostObject[];
  lastQueried: Date;
  sessionUser?: SessionUser;
  refresh: (lastQueried: Date) => Promise<PostObject[]>;
  send?: (
    input: string,
    mentions: string[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
  initialReversed: boolean;
  initialSortingColumn: PostsSortingColumn;
}) {
  const cookiePrefix = getCookiePrefix(sessionUser?.id);

  const [posts, setPosts] = useState(postsProp);

  useEffect(() => {
    setPosts(postsProp);
  }, [postsProp]);

  const lastQueried = useRef(lastQueriedProp);

  const [reversed, setReversed] = useCookies<boolean>(
    `${cookiePrefix}posts_reversed`,
    initialReversed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  const [sortingColumn, setSortingColumn] = useCookies<PostsSortingColumn>(
    `${cookiePrefix}posts_sorting_column`,
    initialSortingColumn,
    parsePostsSortingColumnCookie,
    stringifyPostsSortingColumnCookie,
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
        />
      )}

      <div
        className={cn(
          "flex flex-col items-start gap-2 border-b bg-container p-2 px-2 md:flex-row md:items-center md:justify-between",
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
        />
      </div>
      <ItemsView>
        {treatedPosts.map((post) => (
          <PostView key={post.id} post={post} sessionUserId={sessionUser?.id} />
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
