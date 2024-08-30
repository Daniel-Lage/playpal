"use client";

import type { Session } from "next-auth";
import type { Playlist } from "~/lib/types";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlaylists } from "~/server/queries";

export function Playlists({ session }: { session: Session }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    getPlaylists(session.user.id)
      .then((value) => setPlaylists(value))
      .catch(console.error);
  }, [session]);

  return (
    <div className="grid grid-cols-2 gap-2 p-2 pt-0 md:grid-cols-4 md:gap-4">
      {playlists.map((playlist) => (
        <Link
          href={`/playlist/${playlist.id}`}
          key={playlist.id}
          className="bg-secondary flex flex-col items-center overflow-hidden rounded-2xl"
        >
          <Image
            width={500}
            height={500}
            className="aspect-square"
            src={playlist.images[0]?.url ?? ""}
            alt={playlist.name}
          />

          <div className="h-16 px-2 pt-2 text-center">{playlist.name}</div>
        </Link>
      ))}
    </div>
  );
}
