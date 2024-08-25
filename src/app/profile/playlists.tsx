"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type Playlist } from "spotify-types";

async function getData() {
  const response = await fetch("/api/playlists");
  const json = (await response.json()) as Playlist[];

  return json;
}

export function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[] | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData()
      .then((data: Playlist[]) => {
        setPlaylists(data);
        setLoading(false);
      })
      .catch(console.log);
  }, []);

  console.log(playlists);

  if (loading) return <div>loading</div>;

  if (!playlists?.map) return <div>error</div>;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {playlists.map((playlist, index) => (
        <Link
          href="/playlist" // WIP
          key={index}
          className="flex flex-col items-center"
        >
          <Image
            width={500}
            height={500}
            className="aspect-square w-full rounded-2xl"
            src={playlist.images[0]?.url ?? ""}
            alt={playlist.name}
          />

          <div>{playlist.name}</div>
        </Link>
      ))}
    </div>
  );
}
