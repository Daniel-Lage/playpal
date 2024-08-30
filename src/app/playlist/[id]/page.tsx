"use client";

import Image from "next/image";
import type { Device, Playlist } from "~/lib/types";
import { Track } from "../../_components/track";
import { getDevices, getPlaylist, play, playFrom } from "~/server/queries";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import DevicePicker from "~/app/_components/devicepicker";
import { UserView } from "~/app/_components/userview";

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
                play(session.user.id, playlist.tracks.items, target.id)
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
            setPlaying(true);
            playFrom(
              session.user.id,
              playlist.tracks.items,
              track.track.uri,
              target?.id,
            )
              .then(() => setPlaying(false))
              .catch(console.error);
          }}
        />
      ))}
    </>
  );
}
