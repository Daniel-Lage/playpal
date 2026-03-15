"use client";
import type { User } from "node_modules/next-auth/core/types";
import { useCallback, useMemo, useState } from "react";
import { ItemsView } from "~/components/items-view";
import { PostCreator } from "~/components/post-creator";
import { Sorter } from "~/components/sorter";
import { useLocalStorage } from "~/hooks/use-local-storage";
import type { PlaylistObject } from "~/models/playlist.model";
import {
  type Substring,
  type IMetadata,
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import { ActionStatus } from "~/models/status.model";
import { getTreatedReplies } from "../../../helpers/get-treated-replies";
import { PopupType, PopupView } from "~/components/popup-view";
import { Check, X } from "lucide-react";
import { Thread } from "~/components/thread";

export function PlaylistRepliesView({
  playlist,
  sessionUser,
  send,
}: {
  playlist: PlaylistObject;
  sessionUser?: User | undefined;
  send?: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
}) {
  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUser?.id
      ? `${sessionUser.id}:playlist_replies_reversed`
      : "playlist_replies_reversed",
    false,
    useCallback((text: string | null) => text === "true", []),
    useCallback(
      (value: boolean | null) => (value === true ? "true" : "false"),
      [],
    ),
  );
  const [sortingColumn, setSortingColumn] = useLocalStorage<PostsSortingColumn>(
    sessionUser?.id
      ? `${sessionUser.id}:playlist_replies_sorting_column`
      : "playlist_replies_sorting_column",
    PostsSortingColumn.CreatedAt,
    useCallback((text) => {
      if (PostsSortingColumnOptions.some((psco) => psco === text))
        return text as PostsSortingColumn;
      return null;
    }, []),
    useCallback((psc) => psc, []),
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
      <div className="border-b-2 border-background bg-secondary p-2 text-xl font-bold">
        Replies
      </div>

      {sessionUser?.image && sessionUser?.name && (
        <PostCreator
          send={handleSend}
          sessionUser={sessionUser}
          disabled={status === ActionStatus.Active}
          setStatus={setStatus}
        />
      )}

      <div className="flex flex-col items-start gap-2 bg-secondary p-2 md:flex-row md:items-center md:justify-between">
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

      {status !== ActionStatus.Active && status !== ActionStatus.Inactive && (
        <StatusMessage status={status} />
      )}
    </>
  );
}

function StatusMessage({ status }: { status: ActionStatus }) {
  if (status === ActionStatus.Success)
    return (
      <PopupView type={PopupType.Success}>
        <Check size={40} />
        Reply Sent Sucessfully
      </PopupView>
    );

  return (
    <PopupView type={PopupType.ServerError}>
      <X size={40} />
      Internal Server Error
    </PopupView>
  );
}
