"use client";

import Image from "next/image";
import type { PlaylistTrack } from "~/lib/types";

export function Track({
  track,
  deviceId,
  playFrom,
  playing,
}: {
  track: PlaylistTrack;
  deviceId: string | undefined;
  playFrom: () => void;
  playing: boolean;
}) {
  if (track.is_local)
    return (
      <div className="flex items-center gap-4 rounded-md bg-green-200 p-1 font-bold">
        <button className="flex aspect-square h-10 w-10 items-center justify-center font-extrabold text-red-500 hover:text-red-700">
          Local
        </button>
        <div className="aspect-square h-10 w-10 rounded-lg bg-black" />
        <div className="grow text-left">{track.track.name}</div>
        {track.track.artists.map((artist) => artist.name).join(", ")}
      </div>
    );

  if (!deviceId || playing)
    return (
      <div className="flex items-center gap-4 rounded-md bg-green-200 p-1 font-bold">
        <div className="flex aspect-square h-10 w-10 items-center justify-center font-extrabold text-red-500 hover:text-red-700"></div>
        <Image
          width={40}
          height={40}
          className="aspect-square rounded-lg"
          src={track.track.album.images[0]?.url ?? ""}
          alt={track.track.album.name}
        />
        <div className="grow text-left">{track.track.name}</div>
        {track.track.artists.map((artist) => artist.name).join(", ")}
      </div>
    );

  return (
    <div className="flex items-center gap-4 rounded-md bg-green-200 p-1 font-bold">
      <button
        onClick={() => playFrom()}
        className="flex aspect-square h-10 w-10 items-center justify-center font-extrabold text-red-500 hover:text-red-700"
      >
        Play
      </button>
      <Image
        width={40}
        height={40}
        className="aspect-square rounded-lg"
        src={track.track.album.images[0]?.url ?? ""}
        alt={track.track.album.name}
      />
      <div className="grow text-left">{track.track.name}</div>
      {track.track.artists.map((artist) => artist.name).join(", ")}
    </div>
  );
}
