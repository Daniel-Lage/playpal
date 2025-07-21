"use client";

import { useCallback, useMemo, useState } from "react";

import {
  TracksSortingColumnOptions,
  TracksSortingColumn,
  type PlaylistTrack,
  playTracksStatus,
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
  postPostStatus,
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import type { Device } from "~/models/device.model";
import { DevicePicker } from "~/components/device-picker";

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
  ) => Promise<playTracksStatus | Device[]>;
  expires_at?: number | null;
  send?: (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => Promise<postPostStatus>;
}) {
  const [shuffled, setShuffled] = useLocalStorage<boolean>(
    sessionUser?.id ? `${sessionUser?.id}:play_shuffled` : "play_shuffled",
    true,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [status, setStatus] = useState<playTracksStatus>(
    playTracksStatus.Inactive,
  );

  const handlePlay = useCallback(
    async (start?: PlaylistTrack, device?: Device) => {
      if (!sessionUser?.id) {
        void signIn("spotify");
        return;
      }
      if (!play || !expires_at || !queue) return;

      setStatus(playTracksStatus.Active);

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
          setStatus(playTracksStatus.Inactive);
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
        disabled={status === playTracksStatus.Active}
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

function PlayStatusMessage({ status }: { status: playTracksStatus }) {
  if (status === playTracksStatus.Sucess)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-green-500 px-4 py-8 md:w-fit">
          <Check size={40} />
          Playing Tracks Successfully
        </div>
      </div>
    );

  if (status === playTracksStatus.NoDevice)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-yellow-500 px-4 py-8 md:w-fit">
          <SearchX size={40} />
          Spotify Device Not Found
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
  status: playTracksStatus;
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
        disabled={status === playTracksStatus.Active}
        playTrack={playTrack}
      />

      {status !== playTracksStatus.Active &&
        status !== playTracksStatus.Inactive && (
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
  ) => Promise<postPostStatus>;
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
      {sessionUser?.image && sessionUser?.name && (
        <PostCreator
          send={handleSend}
          sessionUser={sessionUser}
          disabled={status === postPostStatus.Active}
          setStatus={setStatus}
        />
      )}

      <div className="flex flex-col items-start gap-2 rounded-md bg-primary p-2 md:flex-row md:items-center md:justify-between">
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

      {treatedReplies.map((thread) => (
        <Thread
          key={`${thread[0]?.id}:thread`}
          thread={thread.map((replier) => replier)}
          sessionUserId={sessionUser?.id}
        />
      ))}

      {status !== postPostStatus.Active &&
        status !== postPostStatus.Inactive && (
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

function SendStatusMessage({ status }: { status: postPostStatus }) {
  if (status === postPostStatus.Sucess)
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
