"use client";

import { Check, X } from "lucide-react";
import type { User } from "next-auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlaylistView } from "~/components/playlist-view";
import { PostCreator } from "~/components/post-creator";
import { PostView } from "~/components/post-view";
import { Sorter } from "~/components/sorter";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { cn } from "~/lib/utils";

import type {
  IMetadata,
  MainPostObject,
  PostObject,
  Substring,
} from "~/models/post.model";

import {
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";

import type { ReplyObject } from "~/models/reply.model";
import { ActionStatus } from "~/models/status.model";

export function PostPageView({
  post,
  sessionUser,
  lastQueried: lastQueriedProp,
  refresh,
  send,
}: {
  post: MainPostObject;
  lastQueried: Date;
  sessionUser?: User | undefined;
  refresh: (lastQueried: Date) => Promise<ReplyObject[][]>;
  send?: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
}) {
  const [replies, setReplies] = useState(post.replyThreads ?? []);

  const lastQueried = useRef(lastQueriedProp);

  useEffect(() => {
    // every 10 seconds tries to get replies from the last 10 seconds
    const interval = setInterval(() => {
      refresh(lastQueried.current)
        .then((newReplies) => {
          setReplies((replies) => [...newReplies, ...replies]);
          lastQueried.current = new Date();
        })
        .catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [refresh]);

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUser?.id ? `${sessionUser.id}:replies_reversed` : "replies_reversed",
    false,
    useCallback((text: string | null) => text === "true", []),
    useCallback(
      (value: boolean | null) => (value === true ? "true" : "false"),
      [],
    ),
  );

  const [sortingColumn, setSortingColumn] = useLocalStorage<PostsSortingColumn>(
    sessionUser?.id
      ? `${sessionUser.id}:replies_sorting_column`
      : "replies_sorting_column",
    PostsSortingColumn.CreatedAt,
    useCallback((text) => {
      if (PostsSortingColumnOptions.some((psco) => psco === text))
        return text as PostsSortingColumn;
      return null;
    }, []),
    useCallback((psc) => psc, []), // already is text so no conversion is needed
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
      urls: Substring[] | undefined,
      metadata: IMetadata | undefined,
    ) => {
      if (!send) return;

      setStatus(ActionStatus.Active);

      setStatus(await send(input, urls, metadata));

      setTimeout(() => {
        setStatus(ActionStatus.Inactive);
      }, 4000);
    },
    [send],
  );

  return (
    <>
      <div className="flex flex-col rounded-md bg-primary">
        <div className="flex justify-stretch">
          <div className="flex w-full flex-col items-stretch">
            <div>
              {!!post.playlist && (
                <>
                  <PlaylistView
                    playlist={post.playlist}
                    focused={true}
                    sessionUserId={sessionUser?.id}
                  />
                  <div className="mx-4 h-1 self-center rounded-sm bg-secondary-foreground"></div>
                </>
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
      </div>
      <div className="flex flex-col items-start gap-2 rounded-md bg-primary p-2 md:flex-row md:items-center md:justify-between">
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

      {treatedReplies.map((thread) => (
        <Thread
          key={`${thread[0]?.replierId}:thread`}
          thread={thread.map(({ replier }) => replier)}
          sessionUserId={sessionUser?.id}
        />
      ))}

      {status !== ActionStatus.Active && status !== ActionStatus.Inactive && (
        <StatusMessage status={status} />
      )}
    </>
  );
}

export function Thread({
  thread,
  sessionUserId,
  isMainPost = false,
}: {
  thread: (PostObject | undefined)[];
  sessionUserId: string | null | undefined;
  isMainPost?: boolean;
}) {
  const [cutoff, setCutoff] = useState(thread.length - 1);

  return (
    <div
      className={cn(
        "flex flex-col justify-stretch rounded-md",
        isMainPost ? "bg-primary" : "bg-secondary",
      )}
    >
      {thread.map(
        (post, index) =>
          post &&
          index <= cutoff && (
            <PostView
              isMainPost={isMainPost}
              key={post.id}
              post={post}
              sessionUserId={sessionUserId}
              isCutoff={isMainPost ? false : index === cutoff}
              isLastPost={isMainPost ? false : index === thread.length - 1}
              CutOff={() =>
                isMainPost ||
                setCutoff(index === cutoff ? thread.length - 1 : index)
              }
            />
          ),
      )}
    </div>
  );
}

function getTreatedReplies(
  replies: ReplyObject[][],
  sortingColumn: PostsSortingColumn,
) {
  return replies.sort((replyThreadA, replyThreadB) => {
    const key = {
      // compares first post of thread
      [PostsSortingColumn.Likes]: (thread: ReplyObject[]) =>
        thread[0]?.replier?.likes?.length,
      [PostsSortingColumn.Replies]: (thread: ReplyObject[]) =>
        thread[0]?.replier?.replies.length,
      [PostsSortingColumn.CreatedAt]: (thread: ReplyObject[]) =>
        thread[0]?.replier?.createdAt,
    }[sortingColumn];

    const keyA = key(replyThreadA);
    const keyB = key(replyThreadB);

    if (!keyA || !keyB) return 0;
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}

function StatusMessage({ status }: { status: ActionStatus }) {
  if (status === ActionStatus.Success)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-green-500 px-4 py-8 md:w-fit">
          <Check size={40} />
          Reply Sent Sucessfully
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
