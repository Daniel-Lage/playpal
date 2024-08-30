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
  return (
    <button
      className="bg-secondary flex items-center gap-1 p-1 font-bold md:rounded-lg"
      disabled={!deviceId || playing || track.is_local}
      onClick={playFrom}
    >
      {track.track.album.images[0]?.url ? (
        <Image
          width={40}
          height={40}
          className="rounded-md"
          src={track.track.album.images[0]?.url ?? ""}
          alt={track.track.album.name}
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-black" />
      )}
      <div className="grow overflow-hidden">
        <div className="flex grow overflow-hidden">
          <div className="w-full truncate text-left text-sm md:w-1/2">
            {track.track.name}
          </div>
          <div className="w-0 truncate text-left text-sm md:w-1/2">
            {track.track.album.name}
          </div>
        </div>
        <div className="w-full truncate text-left text-xs">
          {track.track.artists.map((artist) => artist.name).join(", ")}
        </div>
      </div>
    </button>
  );
}
