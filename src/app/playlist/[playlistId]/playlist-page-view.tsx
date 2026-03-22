"use client";

import { useCallback, useState } from "react";

import { type PlaylistTrack } from "~/models/track.model";

import type { PlaylistObject } from "~/models/playlist.model";
import { PlaylistTab } from "~/models/playlist.model";
import { PlaylistContent } from "./playlist-content";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { signIn } from "next-auth/react";
import { setFirstItem } from "~/helpers/set-first-item";
import type { User } from "next-auth";
import type { IMetadata } from "~/models/post.model";
import type { Device } from "~/models/device.model";
import { DevicePicker } from "~/components/device-picker";
import { type ActionStatus, PlayTracksStatus } from "~/models/status.model";
import { PlaylistTracksView } from "./playlist-tracks-view";
import { PlaylistRepliesView } from "./playlist-replies-view";
import { PageView } from "~/components/page-view";
import type { PlaylistLikeObject } from "~/models/like.model";
import { UserFeedView } from "~/components/user-feed-view";
import type { UserObject } from "~/models/user.model";

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
    mentions?: string[] | undefined,
    metadata?: IMetadata | undefined,
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

      const expired = expires_at < Math.floor(new Date().getTime() / 1000);

      const result = await play(expired, newQueue, device);

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
      {status === PlayTracksStatus.Active && (
        <div className="fixed z-10 flex h-full w-svw items-center justify-center backdrop-brightness-50 md:ml-[--nav-bar-w] md:w-[--main-view-w]">
          <div className="h-16 w-16 animate-spin rounded-full border-8 border-secondary border-b-transparent"></div>
        </div>
      )}
      <PageView
        sideContent={
          <PlaylistRepliesView
            playlist={playlist}
            sessionUser={sessionUser}
            send={send}
          />
        }
      >
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
      </PageView>
    </>
  );
}

function PlaylistLikesView({ likes }: { likes: PlaylistLikeObject[] }) {
  return (
    <UserFeedView
      users={likes
        .map((like) => like?.liker as UserObject)
        .filter((user) => !!user)}
    />
  );
}
