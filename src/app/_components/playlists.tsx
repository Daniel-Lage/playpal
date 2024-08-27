"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type Playlist } from "~/lib/types";

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[] | null>();
  const [loading, setLoading] = useState(true);

  async function getPlaylists() {
    const response = await fetch("/api/playlists");
    const json = (await response.json()) as Playlist[];

    return json;
  }

  useEffect(() => {
    getPlaylists()
      .then((playlists: Playlist[]) => {
        setPlaylists(playlists);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  if (!playlists?.map)
    return <div className="text-white">Error: Could not load</div>;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {playlists.map((playlist) => (
        <Link
          href={`/playlist/${playlist.id}`} // WIP
          key={playlist.id}
          className="flex flex-col items-center overflow-hidden rounded-2xl bg-zinc-500 hover:bg-zinc-600"
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
