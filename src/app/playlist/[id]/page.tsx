"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type Playlist } from "~/common/types";
import { Track } from "../../_components/track";

async function getData(id: string) {
  const response = await fetch(`/api/playlist/${id}`);
  const json = (await response.json()) as Playlist;

  return json;
}

export default function Playlist({
  params: { id },
}: {
  params: { id: string };
}) {
  const [playlist, setPlaylist] = useState<Playlist>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData(id)
      .then((data: Playlist) => {
        setPlaylist(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading) return <div className="text-white">Loading...</div>;

  if (!playlist) return <div className="text-white">Error: Could not load</div>;

  return (
    <>
      <div className="flex w-full items-center gap-4 rounded-2xl bg-lime-200 p-4">
        <Image
          width={300}
          height={300}
          className="aspect-square rounded-xl"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />
        <div className="h-16 px-2 pt-2">
          <div className="text-6xl font-bold">{playlist.name}</div>
          {playlist.owner.display_name}
        </div>
      </div>
      {playlist.tracks.items.map((track) => (
        <Track key={track.track.id} track={track} />
      ))}
    </>
  );
}
