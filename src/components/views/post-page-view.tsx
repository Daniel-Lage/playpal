"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItemsView } from "~/components/views/items-view";
import { PlaylistView } from "~/components/views/playlist-view";
import { PostCreator } from "~/components/post-creator";
import { PostView } from "~/components/views/post-view";
import { Sorter } from "~/components/sorter";
import { useCookies } from "~/hooks/use-cookies";

import type { IMetadata, MainPostObject } from "~/models/post.model";

import {
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";

import type { ReplyObject } from "~/models/reply.model";
import { ActionStatus } from "~/models/status.model";
import { Thread } from "~/components/thread";
import type { SessionUser } from "~/models/user.model";
import { StatusMessage } from "~/components/message-status";
import { cn } from "~/lib/utils";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import {
  stringifyBooleanCookie,
  stringifyPostsSortingColumnCookie,
} from "~/helpers/stringify-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";

export function PostPageView({
  post,
  sessionUser,
  lastQueried: lastQueriedProp,
  refresh,
  send,
  initialReversed,
  initialSortingColumn,
}: {
  post: MainPostObject;
  lastQueried: Date;
  sessionUser?: SessionUser;
  refresh: (lastQueried: Date) => Promise<ReplyObject[][]>;
  send?: (
    input: string,
    mentions?: string[],
    metadata?: IMetadata,
  ) => Promise<ActionStatus>;

  initialReversed: boolean;
  initialSortingColumn: PostsSortingColumn;
}) {
  const cookiePrefix = getCookiePrefix(sessionUser?.id);

  const [replies, setReplies] = useState(post.replyThreads ?? []);

  const lastQueried = useRef(lastQueriedProp);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh(lastQueried.current)
        .then((newReplies) => {
          setReplies((replies) => [...newReplies, ...replies]);
          lastQueried.current = new Date();
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  const [reversed, setReversed] = useCookies<boolean>(
    `${cookiePrefix}replies_reversed`,
    initialReversed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  const [sortingColumn, setSortingColumn] = useCookies<PostsSortingColumn>(
    `${cookiePrefix}replies_sorting_column`,
    initialSortingColumn,
    parsePostsSortingColumnCookie,
    stringifyPostsSortingColumnCookie,
  );

  const treatedReplies = useMemo(() => {
    const temp = getTreatedReplies([...replies], sortingColumn);

    if (reversed) return temp.reverse();

    return temp;
  }, [replies, sortingColumn, reversed]);

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
      <div
        className={cn(
          "flex flex-col border-b",
          sessionUser?.image && sessionUser?.name && "border-b-0",
        )}
      >
        <div className="flex justify-stretch">
          <div className="flex w-full flex-col items-stretch">
            {!!post.playlist && (
              <PlaylistView
                playlist={post.playlist}
                sessionUserId={sessionUser?.id}
                focused={true}
              />
            )}

            {post.thread && (
              <Thread
                thread={post.thread.map(({ repliee }) => repliee)}
                sessionUserId={sessionUser?.id}
                isMainPost={true}
              />
            )}

            <PostView
              post={post}
              sessionUserId={sessionUser?.id}
              isMainPost={true}
              hasReplyBox={!!(sessionUser?.image && sessionUser?.name)}
            />

            {sessionUser?.image && sessionUser?.name && (
              <PostCreator
                send={handleSend}
                sessionUser={sessionUser}
                disabled={status === ActionStatus.Active}
                setStatus={setStatus}
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 p-2 md:flex-row md:items-center md:justify-between">
        {post.replyThreads?.length ?? 0} Replies
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
        {treatedReplies.map((thread) => (
          <Thread
            key={`${thread[0]?.replierId}:thread`}
            thread={thread.map(({ replier }) => replier)}
            sessionUserId={sessionUser?.id}
          />
        ))}
      </ItemsView>

      <StatusMessage status={status} actionDone="Reply Sent" />
    </>
  );
}

function getTreatedReplies(
  replies: ReplyObject[][],
  sortingColumn: PostsSortingColumn,
) {
  return replies.sort((replyThreadA, replyThreadB) => {
    const key = {
      [PostsSortingColumn.Likes]: (thread: ReplyObject[]) =>
        thread[0]?.replier?.likes?.length,
      [PostsSortingColumn.Replies]: (thread: ReplyObject[]) =>
        thread[0]?.replier?.replies.length,
      [PostsSortingColumn.CreatedAt]: (thread: ReplyObject[]) =>
        thread[0]?.replier?.createdAt,
    }[sortingColumn];

    const keyA = key(replyThreadA);
    const keyB = key(replyThreadB);

    if (keyA == null || keyB == null) return 0;
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}
