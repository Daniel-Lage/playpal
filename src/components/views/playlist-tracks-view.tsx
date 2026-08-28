"use client";
import { useState } from "react";
import { type PlaylistTrack } from "~/models/track.model";
import { PlaylistSearch } from "../playlist-search";
import { PlaylistTracks } from "../playlist-tracks";

export function PlaylistTracksView({
  tracks,
  playTrack,
  disabled,
}: {
  tracks: PlaylistTrack[];
  disabled: boolean;
  playTrack: (track: PlaylistTrack) => void;
}) {
  const [filter, setFilter] = useState("");

  return (
    <>
      <PlaylistSearch
        filter={filter}
        filterTracks={(e) => setFilter(e.target.value)}
      />

      <PlaylistTracks
        treatedTracks={tracks}
        disabled={disabled}
        playTrack={playTrack}
      />
    </>
  );
}
