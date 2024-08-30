"use client";

import Image from "next/image";
import type { Device, Playlist, PlaylistTrack } from "~/lib/types";
import { Track } from "../../_components/track";
import { getDevices, getPlaylist } from "~/server/queries";
import type { Session } from "next-auth";
import { useEffect, useMemo, useState } from "react";
import { UserView } from "~/app/_components/userview";
import { refreshTokens } from "~/lib/utils";

function takeRandomly<T>(array: Array<T>, limit?: number): Array<T> {
  const size = !limit || limit > array.length ? array.length : limit;

  const newArray: Array<T> = [];
  const prevArray = [...array];

  for (let index = 0; index < size; index++) {
    const index = Math.floor(Math.random() * prevArray.length);
    const item = prevArray.splice(index, 1)[0];
    if (item) newArray.push(item);
  }

  return newArray;
}

async function play(userId: string, tracks: PlaylistTrack[], deviceId: string) {
  const tokens = await refreshTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.log("Tracks: ", tracks);
    console.log("Shuffled Tracks: ", tracks);

    throw new Error("Empty Track Array");
  }

  const addedToQueue = await fetch(
    "https://api.spotify.com/v1/me/player/queue?" +
      new URLSearchParams({
        uri: firstTrack.track.uri,
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

  if (addedToQueue.status != 200) {
    console.log("Response: ", addedToQueue);

    throw new Error(addedToQueue.statusText);
  }

  const skipped = await fetch(
    "https://api.spotify.com/v1/me/player/next?" +
      new URLSearchParams({
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

  if (skipped.status != 200) {
    console.log("Response: ", skipped);

    throw new Error(skipped.statusText);
  }

  for (let index = 0; index < tracks.length; index++) {
    const track = tracks[index];
    if (track) {
      track.track.disc_number = index;
      fetch(
        "https://api.spotify.com/v1/me/player/queue?" +
          new URLSearchParams({
            uri: track.track.uri,
            device_id: deviceId,
          }).toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer  ${tokens.access_token}`,
          },
        },
      ).catch(() => {
        console.error(track.track.disc_number, "EXCEEDED", track.track.name);
      });
    }
  }
}

export default function Playlist({
  params: { id },
}: {
  params: { id: string };
}) {
  const [session, setSession] = useState<Session | undefined>();
  const [playlist, setPlaylist] = useState<Playlist | undefined>();
  const [target, setTarget] = useState<Device | undefined>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [playing, setPlaying] = useState(false);

  const shuffledTracks = useMemo(() => {
    if (!playlist) return [];

    return takeRandomly(
      playlist.tracks.items.filter((value) => !value.is_local),
      99,
    );
  }, [playlist]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => {
        if (!response.ok) {
          throw new Error("No Session");
        }
        return response.json();
      })
      .then((session: Session) => {
        setSession(session);

        getPlaylist(session.user.id, id)
          .then((playlist) => {
            setPlaylist(playlist);
          })
          .catch(console.error);

        getDevices(session.user.id)
          .then((devices) => {
            setDevices(devices);
            setTarget(devices[0]);
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, [id]);

  if (!playlist || !session) return <UserView session={session} />;

  return (
    <>
      <div className="grid grid-cols-1 overflow-hidden md:rounded-2xl">
        <div className="bg-main1 flex w-full flex-col items-center gap-2 p-2 md:flex-row md:items-start">
          <Image
            width={240}
            height={240}
            className="rounded-xl"
            src={playlist.images[0]?.url ?? ""}
            alt={playlist.name}
          />
          <div className="flex flex-col items-start p-2">
            <div className="text-xl font-bold md:text-6xl">{playlist.name}</div>
            <div className="text-sm font-light md:text-lg">
              {playlist.description}
            </div>
            <div className="text-sm font-bold md:text-xl">
              {playlist.owner.display_name} - {playlist.tracks.total} songs
            </div>
          </div>
        </div>

        <div className="bg-main2 flex w-full justify-between gap-4 p-4">
          <div className="flex gap-2">
            <div className="bg-main3 flex flex-col items-center rounded-xl text-center">
              {devices.length > 0 && target ? (
                <>
                  <div className="w-full p-1 font-bold">
                    Pick spotify device
                  </div>
                  <select
                    className="bg-main1 w-full cursor-pointer rounded-b-lg p-1 text-center"
                    onChange={(e) => {
                      const target = devices.find(
                        (value) => value.name == e.target.value,
                      );
                      setTarget(target);
                    }}
                  >
                    {devices.map((device) => (
                      <option key={device.id}>{device.name}</option>
                    ))}
                  </select>
                </>
              ) : (
                <div className="p-2 font-bold">No active spotify device</div>
              )}
            </div>
            <button
              onClick={() => {
                getDevices(session.user.id)
                  .then((devices) => {
                    setDevices(devices);
                    setTarget(devices[0]);
                  })
                  .catch(console.error);
              }}
            >
              <Image
                height={32}
                width={32}
                src="/reload.svg"
                alt="reload icon"
              />
            </button>
          </div>
          {target && !playing && (
            <button
              className="font-extrabold text-red-500"
              onClick={async () => {
                setPlaying(true);
                play(session.user.id, shuffledTracks, target.id)
                  .then(() => setPlaying(false))
                  .catch(console.error);
              }}
            >
              <Image height={32} width={32} src="/play.svg" alt="play icon" />
            </button>
          )}
        </div>
      </div>

      {playlist.tracks.items.map((track) => (
        <Track
          key={track.track.uri}
          track={track}
          deviceId={target?.id}
          playing={playing}
          playFrom={() => {
            if (!target) return;

            setPlaying(true);

            const shuffledTracksWithFirstTrack = [...shuffledTracks];

            const trackIndex = shuffledTracksWithFirstTrack.findIndex(
              (other) => other.track.uri === track.track.uri,
            );

            void shuffledTracksWithFirstTrack.splice(trackIndex, 1)[0];

            shuffledTracksWithFirstTrack.unshift(track);

            play(session.user.id, shuffledTracksWithFirstTrack, target.id)
              .then(() => setPlaying(false))
              .catch(console.error);
          }}
        />
      ))}
    </>
  );
}
