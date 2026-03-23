"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { type PlaylistTrack } from "~/models/track.model";

import type { PlaylistObject } from "~/models/playlist.model";
import { PlaylistTab } from "~/models/playlist.model";
import { PlaylistContent } from "./playlist-content";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { signIn } from "next-auth/react";
import { setFirstItem } from "~/helpers/set-first-item";
import type { IMetadata } from "~/models/post.model";
import { ActionStatus } from "~/models/status.model";
import { PlaylistTracksView } from "./playlist-tracks-view";
import { PlaylistRepliesView } from "./playlist-replies-view";
import { PageView } from "~/components/page-view";
import type { PlaylistLikeObject } from "~/models/like.model";
import { UserFeedView } from "~/components/user-feed-view";
import type { SessionUser, UserObject } from "~/models/user.model";
import { PlayerView } from "~/components/player-view";

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
  sessionUser?: SessionUser | undefined;
  play?: (
    expired: boolean,
    queue: PlaylistTrack[],
    device: string,
  ) => Promise<ActionStatus>;
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

  const [status, setStatus] = useState(ActionStatus.Inactive);
  const [tab, setTab] = useState(PlaylistTab.Tracks);
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [playerState, setPlayerState] = useState<
    Spotify.PlaybackState | undefined
  >();

  const handlePlay = useCallback(
    async (start?: PlaylistTrack) => {
      if (!sessionUser?.id) {
        void signIn();
        return;
      }

      if (!play || !expires_at || !queue || !deviceId) return;

      setStatus(ActionStatus.Active);

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

      const result = await play(expired, newQueue, deviceId);

      if (typeof result === "number") {
        setStatus(result);

        setTimeout(() => {
          setStatus(ActionStatus.Inactive);
        }, 4000);
      }
    },
    [expires_at, play, sessionUser?.id, shuffled, tracks, queue, deviceId],
  );

  const playerRef = useRef<Spotify.Player | undefined>(undefined);

  useEffect(() => {
    if (
      play != null &&
      sessionUser?.access_token != null &&
      playerRef.current == null
    ) {
      const token = sessionUser.access_token;

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new Spotify.Player({
          name: "Playpal",
          getOAuthToken: (cb) => {
            cb(token);
          },
          volume: 0.5,
        });

        player
          .connect()
          .then((success) => {
            if (success) {
              playerRef.current = player;

              player.addListener("ready", (instance) => {
                if (instance != null) setDeviceId(instance.device_id);
              });

              player.addListener("not_ready", () => {
                setDeviceId(undefined);
              });

              player.addListener("player_state_changed", (state) => {
                if (state != null) {
                  setPlayerState(state);
                }
              });
            } else {
              player.disconnect();
            }
          })
          .catch((error) => console.error(error));
      };

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);
    }
    return () => {
      playerRef.current?.disconnect();
      playerRef.current = undefined;
    };
  }, [sessionUser, play]);

  return (
    <>
      {status === ActionStatus.Active && (
        <div className="fixed z-10 flex h-full w-svw items-center justify-center backdrop-brightness-50 md:ml-[--nav-bar-w] md:w-[--main-view-w]">
          <div className="h-16 w-16 animate-spin rounded-full border-8 border-secondary border-b-transparent"></div>
        </div>
      )}
      <PageView
        sessionUser={sessionUser}
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
          disabled={status === ActionStatus.Active}
          shuffled={shuffled}
          switchShuffled={() => {
            setShuffled((prev) => !prev);
          }}
          playlist={playlist}
          sessionUserId={sessionUser?.id}
          tab={tab}
          setTab={setTab}
        />
        <div className="pb-24">
          {
            {
              [PlaylistTab.Tracks]: (
                <PlaylistTracksView
                  playlist={playlist}
                  playTrack={handlePlay}
                  tracks={tracks}
                  disabled={status === ActionStatus.Active}
                  sessionUserId={sessionUser?.id}
                />
              ),
              [PlaylistTab.Likes]: (
                <PlaylistLikesView likes={playlist.likes ?? []} />
              ),
            }[tab]
          }
        </div>

        <PlayerView
          playerState={playerState}
          togglePlay={() => {
            void playerRef.current?.togglePlay();
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
