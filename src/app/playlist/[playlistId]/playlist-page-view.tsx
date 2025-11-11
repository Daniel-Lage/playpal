"use client";

import { useCallback, useMemo, useState } from "react";

import {
  TracksSortingColumnOptions,
  TracksSortingColumn,
  type PlaylistTrack,
} from "~/models/track.model";

import type { SimplifiedArtist } from "~/models/artist.model";
import type { PlaylistObject } from "~/models/playlist.model";
import { PlaylistTab } from "~/models/playlist.model";
import { PlaylistContent } from "./playlist-content";
import { PlaylistSearch } from "./playlist-search";
import { PlaylistTracks } from "./playlist-tracks";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { signIn } from "next-auth/react";
import { Check, SearchX, X } from "lucide-react";
import { setFirstItem } from "~/helpers/set-first-item";
import { UserView } from "~/components/user-view";
import { Thread } from "~/app/post/[postId]/post-page-view";
import type { PlaylistLikeObject } from "~/models/like.model";
import type { User } from "next-auth";
import { PostCreator } from "~/components/post-creator";
import { Sorter } from "~/components/sorter";
import type { IMetadata, PostObject, Substring } from "~/models/post.model";
import {
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import type { Device } from "~/models/device.model";
import { DevicePicker } from "~/components/device-picker";
import { ActionStatus, PlayTracksStatus } from "~/models/status.model";
import { PopupType, PopupView } from "~/components/popup-view";
import { MainContentView } from "~/components/main-content-view";

export function PlaylistPageView({
  playlist,
  tracks,
  sessionUser,
  play,
  expires_at,
  queue,
  send,
}: {
  playlist: PlaylistObject;
  tracks: PlaylistTrack[];
  queue?: PlaylistTrack[];
  sessionUser?: User | undefined;
  play?: (
    expired: boolean,
    queue: PlaylistTrack[],
    device?: Device,
  ) => Promise<PlayTracksStatus | Device[]>;
  expires_at?: number | null;
  send?: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<ActionStatus>;
}) {
  const [shuffled, setShuffled] = useLocalStorage<boolean>(
    sessionUser?.id ? `${sessionUser?.id}:play_shuffled` : "play_shuffled",
    true,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [status, setStatus] = useState<PlayTracksStatus>(
    PlayTracksStatus.Inactive,
  );

  const handlePlay = useCallback(
    async (start?: PlaylistTrack, device?: Device) => {
      if (!sessionUser?.id) {
        void signIn();
        return;
      }
      if (!play || !expires_at || !queue) return;

      setStatus(PlayTracksStatus.Active);

      let newQueue: PlaylistTrack[] = [];

      if (shuffled)
        newQueue = start
          ? setFirstItem(
              queue,
              start,
              (other) => other.track.uri === start.track.uri,
            )
          : queue;
      else {
        newQueue = tracks.filter((track) => !track.is_local);

        const startIndex = start
          ? newQueue.findIndex((other) => other.track.uri === start.track.uri)
          : 0;

        newQueue = newQueue.slice(startIndex, startIndex + 99);
      }

      const result = await play(
        expires_at < Math.floor(new Date().getTime() / 1000),
        newQueue,
        device,
      );

      if (typeof result === "number") {
        setStatus(result);

        setTimeout(() => {
          setStatus(PlayTracksStatus.Inactive);
        }, 4000);
      } else {
        setDevices(result);
        setStoredStart(start);
      }
    },
    [expires_at, play, sessionUser?.id, shuffled, tracks, queue],
  );

  const [tab, setTab] = useState(PlaylistTab.Tracks);

  const [devices, setDevices] = useState<Device[] | undefined>();
  const [storedStart, setStoredStart] = useState<PlaylistTrack | undefined>();

  return (
    <>
      <PlaylistContent
        play={handlePlay}
        disabled={status === PlayTracksStatus.Active}
        shuffled={shuffled}
        switchShuffled={() => {
          setShuffled((prev) => !prev);
        }}
        playlist={playlist}
        sessionUserId={sessionUser?.id}
        tab={tab}
        setTab={setTab}
      />
      {
        {
          [PlaylistTab.Tracks]: (
            <PlaylistTracksView
              playlist={playlist}
              playTrack={handlePlay}
              tracks={tracks}
              status={status}
              sessionUserId={sessionUser?.id}
            />
          ),
          [PlaylistTab.Replies]: (
            <PlaylistRepliesView
              playlist={playlist}
              sessionUser={sessionUser}
              send={send}
            />
          ),
          [PlaylistTab.Likes]: (
            <PlaylistLikesView likes={playlist.likes ?? []} />
          ),
        }[tab]
      }

      <DevicePicker
        devices={devices}
        pickDevice={(device) => {
          void handlePlay(storedStart, device);
          setStoredStart(undefined);
          setDevices(undefined);
        }}
      />
    </>
  );
}

function getTreatedTracks(
  tracks: PlaylistTrack[],
  sortingColumn: TracksSortingColumn,
  filter: string,
) {
  return tracks
    .filter(
      (track) =>
        track.track.name.toLowerCase().includes(filter.toLowerCase()) ||
        track.track.album.name.toLowerCase().includes(filter.toLowerCase()) ||
        track.track.artists.some((artist) =>
          artist.name.toLowerCase().includes(filter.toLowerCase()),
        ),
    )
    .sort((trackA, trackB) => {
      function sortArtists(
        artistA: SimplifiedArtist,
        artistB: SimplifiedArtist,
      ) {
        const key = (artist: SimplifiedArtist) => artist.name.toLowerCase();
        const keyA = key(artistA);
        const keyB = key(artistB);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      }
      const key = {
        [TracksSortingColumn.AddedAt]: () => 0, // default
        [TracksSortingColumn.Album]: (track: PlaylistTrack) =>
          track.track.album.name.toLowerCase(),
        [TracksSortingColumn.Artists]: (track: PlaylistTrack) =>
          track.track.artists.sort(sortArtists)[0]?.name.toLowerCase() ?? 0,
        [TracksSortingColumn.Name]: (track: PlaylistTrack) =>
          track.track.name.toLowerCase(),
      }[sortingColumn];

      const keyA = key(trackA);
      const keyB = key(trackB);

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
}

function PlayStatusMessage({ status }: { status: PlayTracksStatus }) {
  if (status === PlayTracksStatus.Success)
    return (
      <PopupView type={PopupType.Success}>
        <Check size={40} />
        Playing Tracks Successfully
      </PopupView>
    );

  if (status === PlayTracksStatus.NoDevice)
    return (
      <PopupView type={PopupType.UserError}>
        <SearchX size={40} />
        Spotify Device Not Found
      </PopupView>
    );

  return (
    <PopupView type={PopupType.ServerError}>
      <X size={40} />
      Internal Server Error
    </PopupView>
  );
}

function PlaylistTracksView({
  playlist,
  tracks,
  sessionUserId,
  status,
  playTrack,
}: {
  playlist: PlaylistObject;
  tracks: PlaylistTrack[];
  sessionUserId?: string;
  status: PlayTracksStatus;
  playTrack: (track: PlaylistTrack) => void;
}) {
  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUserId ? `${sessionUserId}:tracks_reversed` : "tracks_reversed",
    false,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [sortingColumn, setSortingColumn] =
    useLocalStorage<TracksSortingColumn>(
      sessionUserId
        ? `${sessionUserId}:tracks_sorting_column`
        : "tracks_sorting_column",
      TracksSortingColumn.AddedAt,
      useCallback((text) => {
        if (TracksSortingColumnOptions.some((tsco) => tsco === text))
          return text as TracksSortingColumn;
        return null;
      }, []),
      useCallback((tsc) => tsc, []), // already is text so no conversion is needed
    );

  const treatedTracks = useMemo(() => {
    const temp = getTreatedTracks([...tracks], sortingColumn, filter);

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [tracks, filter, sortingColumn, reversed]);

  return (
    <>
      <PlaylistSearch
        count={playlist.totalTracks}
        sortingColumn={sortingColumn}
        reversed={reversed}
        filter={filter}
        sortColumn={(value: string) =>
          setSortingColumn(value as TracksSortingColumn)
        }
        reverse={() => {
          setReversed((prev) => !prev);
        }}
        filterTracks={(e) => setFilter(e.target.value)}
      />

      <PlaylistTracks
        treatedTracks={treatedTracks}
        disabled={status === PlayTracksStatus.Active}
        playTrack={playTrack}
      />

      {status !== PlayTracksStatus.Active &&
        status !== PlayTracksStatus.Inactive && (
          <PlayStatusMessage status={status} />
        )}
    </>
  );
}

function PlaylistLikesView({ likes }: { likes: PlaylistLikeObject[] }) {
  return likes.map(
    (like) => like?.liker && <UserView key={like.userId} user={like.liker} />,
  );
}

function PlaylistRepliesView({
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
    useCallback((psc) => psc, []), // already is text so no conversion is needed
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
      {sessionUser?.image && sessionUser?.name && (
        <PostCreator
          send={handleSend}
          sessionUser={sessionUser}
          disabled={status === ActionStatus.Active}
          setStatus={setStatus}
        />
      )}

      <div className="flex flex-col items-start gap-2 bg-primary p-2 md:mx-[19vw] md:flex-row md:items-center md:justify-between">
        {playlist.replyThreads?.length ?? 0} Replies
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

      <MainContentView>
        {treatedReplies.map((thread) => (
          <Thread
            key={`${thread[0]?.id}:thread`}
            thread={thread.map((replier) => replier)}
            sessionUserId={sessionUser?.id}
          />
        ))}
      </MainContentView>

      {status !== ActionStatus.Active && status !== ActionStatus.Inactive && (
        <SendStatusMessage status={status} />
      )}
    </>
  );
}

function getTreatedReplies(
  replies: PostObject[][],
  sortingColumn: PostsSortingColumn,
) {
  return replies.sort((replyThreadA, replyThreadB) => {
    const key = {
      // compares first post of thread
      [PostsSortingColumn.Likes]: (thread: PostObject[]) =>
        thread[0]?.likes?.length,
      [PostsSortingColumn.Replies]: (thread: PostObject[]) =>
        thread[0]?.replies.length,
      [PostsSortingColumn.CreatedAt]: (thread: PostObject[]) =>
        thread[0]?.createdAt,
    }[sortingColumn];

    const keyA = key(replyThreadA);
    const keyB = key(replyThreadB);

    if (!keyA || !keyB) return 0;
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}

function SendStatusMessage({ status }: { status: ActionStatus }) {
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
