"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SimplifiedPlaylist } from "spotify-types";

async function getData() {
  const response = await fetch("/api/playlists");
  return await response.json();
}

export function Playlists() {
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[] | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setPlaylists(await getData());
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>loading</div>;

  if (!playlists) return <div>error</div>;
  return (
    <div>
      {playlists.map((playlist) => (
        <div>
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
