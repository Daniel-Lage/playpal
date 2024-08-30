"use client";

import Image from "next/image";
import type { Device, Playlist, PlaylistTrack } from "~/lib/types";
import { Track } from "../../_components/track";
import { getDevices, getPlaylist } from "~/server/queries";
import type { Session } from "next-auth";
import { useEffect, useMemo, useState } from "react";
import DevicePicker from "~/app/_components/devicepicker";
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

  const response = await fetch(
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

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  await fetch(
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
      <div className="flex w-full gap-4 rounded-2xl bg-lime-200 p-4">
        <Image
          width={300}
          height={300}
          className="aspect-square rounded-xl"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />
        <div className="flex flex-col items-start p-2">
          <div className="text-6xl font-bold">{playlist.name}</div>
          <div className="mb-4">{playlist.owner.display_name}</div>
          <DevicePicker
            {...{
              devices,
              setDevices,
              target,
              setTarget,
              session,
            }}
          />
          {target && !playing && (
            <button
              className="font-extrabold text-red-500 hover:text-red-700"
              onClick={async () => {
                setPlaying(true);

                const shuffledTracks = takeRandomly(
                  playlist.tracks.items.filter((value) => !value.is_local),
                  99,
                );

                play(session.user.id, shuffledTracks, target.id)
                  .then(() => setPlaying(false))
                  .catch(console.error);
              }}
            >
              Play
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
