"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type SimplifiedPlaylist } from "spotify-types";

async function getData() {
  const response = await fetch("/api/playlists");
  const json = await response.json() as SimplifiedPlaylist[];

  return json;
}

export function Playlists() {
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[] | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData()
      .then((data: SimplifiedPlaylist[]) => {
        setPlaylists(data);
        setLoading(false);
      })
      .catch(console.log);
  }, []);

  if (loading) return <div>loading</div>;

  if (!playlists) return <div>error</div>;
  return (
    <div>
      {playlists.map((playlist, index) => (
        <div key={index}>
          {typeof playlist.images[0]?.url == "string" && (
            <Image
              width={50}
              height={50}
              src={playlist.images[0]?.url}
              alt={playlist.name}
            />
          )}
          <div>{playlist.name}</div>
        </div>
      ))}
    </div>
  );
}
