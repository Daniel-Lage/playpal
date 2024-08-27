"use client";

import Image from "next/image";
import type { PlaylistTrack } from "~/lib/types";

export function Track({ track }: { track: PlaylistTrack }) {
  if (track.is_local)
    return (
      <div key={track.track.id} className="w-full rounded-xl bg-zinc-800 p-4">
        <div className="flex items-center gap-4 font-bold">
          <div className="grow">{track.track.name}</div>
          {track.track.artists.map((artist) => artist.name).join(", ")}
        </div>
      </div>
    );

  return (
    <div
      key={track.track.id}
      className="w-full cursor-pointer rounded-xl bg-zinc-500 p-2 hover:bg-zinc-600"
    >
      <div className="flex items-center gap-4 font-bold">
        <Image
          width={40}
          height={40}
          className="aspect-square rounded-lg"
          src={track.track.album.images[0]?.url ?? ""}
          alt={track.track.album.name}
        />
        <div className="grow">{track.track.name}</div>
        {track.track.artists.map((artist) => artist.name).join(", ")}
      </div>
    </div>
  );
}
