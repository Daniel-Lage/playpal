"use client";

import { useCallback, useMemo, useState } from "react";
import { ItemsView } from "~/components/views/items-view";
import { PostCreator } from "~/components/post-creator";
import { Sorter } from "~/components/sorter";
import { useCookies } from "~/hooks/use-cookies";
import type { PlaylistObject } from "~/models/playlist.model";
import {
  type IMetadata,
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import { ActionStatus } from "~/models/status.model";
import { Thread } from "~/components/thread";
import type { SessionUser } from "~/models/user.model";
import { StatusMessage } from "~/components/message-status";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import {
  stringifyBooleanCookie,
  stringifyPostsSortingColumnCookie,
} from "~/helpers/stringify-cookie";
import { getTreatedReplies } from "~/helpers/get-treated-replies";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";

export function PlaylistRepliesView({
  playlist,
  sessionUser,
  send,

  initialReversed,
  initialSortingColumn,
}: {
  playlist: PlaylistObject;
  sessionUser?: SessionUser;
  send?: (
    input: string,
    mentions?: string[],
    metadata?: IMetadata,
  ) => Promise<ActionStatus>;

  initialReversed: boolean;
  initialSortingColumn: PostsSortingColumn;
}) {
  const cookiePrefix = getCookiePrefix(sessionUser?.id);

  const [reversed, setReversed] = useCookies<boolean>(
    `${cookiePrefix}playlist_replies_reversed`,
    initialReversed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  const [sortingColumn, setSortingColumn] = useCookies<PostsSortingColumn>(
    `${cookiePrefix}playlist_replies_sorting_column`,
    initialSortingColumn,
    parsePostsSortingColumnCookie,
    stringifyPostsSortingColumnCookie,
  );

  const treatedReplies = useMemo(() => {
    const temp = getTreatedReplies(
      [...(playlist.replyThreads ?? [])],
      sortingColumn,
    );

    if (reversed) return temp.reverse();

    return temp;
  }, [playlist.replyThreads, sortingColumn, reversed]);

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
      {sessionUser?.image && sessionUser?.name && (
        <PostCreator
          send={handleSend}
          sessionUser={sessionUser}
          disabled={status === ActionStatus.Active}
          setStatus={setStatus}
        />
      )}

      <div className="flex flex-col items-start gap-2 border-b bg-container p-2 md:flex-row md:items-center md:justify-between">
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
            key={`${thread[0]?.id}:thread`}
            thread={thread.map((replier) => replier)}
            sessionUserId={sessionUser?.id}
          />
        ))}
      </ItemsView>

      <StatusMessage status={status} actionDone="Reply Sent" />
    </>
  );
}
