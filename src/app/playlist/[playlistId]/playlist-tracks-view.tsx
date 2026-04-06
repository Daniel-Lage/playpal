"use client";
import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import {
  type PlaylistTrack,
  TracksSortingColumn,
  TracksSortingColumnOptions,
} from "~/models/track.model";
import { PlaylistSearch } from "./playlist-search";
import { PlaylistTracks } from "./playlist-tracks";
import type { SimplifiedArtist } from "~/models/artist.model";

export function PlaylistTracksView({
  tracks,
  sessionUserId,
  playTrack,
  disabled,
}: {
  tracks: PlaylistTrack[];
  sessionUserId?: string;
  disabled: boolean;
  playTrack: (track: PlaylistTrack) => void;
}) {
  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUserId ? `${sessionUserId}:tracks_reversed` : "tracks_reversed",
    false,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [sortingColumn, setSortingColumn] =
    useLocalStorage<TracksSortingColumn>(
      sessionUserId
        ? `${sessionUserId}:tracks_sorting_column`
        : "tracks_sorting_column",
      TracksSortingColumn.AddedAt,
      useCallback((text) => {
        if (TracksSortingColumnOptions.some((tsco) => tsco === text))
          return text as TracksSortingColumn;
        return null;
      }, []),
      useCallback((tsc) => tsc, []),
    );

  const treatedTracks = useMemo(() => {
    const temp = getTreatedTracks([...tracks], sortingColumn, filter);

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [tracks, filter, sortingColumn, reversed]);

  return (
    <>
      <PlaylistSearch
        sortingColumn={sortingColumn}
        reversed={reversed}
        filter={filter}
        sortColumn={(value: string) =>
          setSortingColumn(value as TracksSortingColumn)
        }
        reverse={() => {
          setReversed((prev) => !prev);
        }}
        filterTracks={(e) => setFilter(e.target.value)}
      />

      <PlaylistTracks
        treatedTracks={treatedTracks}
        disabled={disabled}
        playTrack={playTrack}
      />
    </>
  );
}

function getTreatedTracks(
  tracks: PlaylistTrack[],
  sortingColumn: TracksSortingColumn,
  filter: string,
) {
  return tracks
    .filter(
      (track) =>
        track.track.name.toLowerCase().includes(filter.toLowerCase()) ||
        track.track.album.name.toLowerCase().includes(filter.toLowerCase()) ||
        track.track.artists.some((artist) =>
          artist.name.toLowerCase().includes(filter.toLowerCase()),
        ),
    )
    .sort((trackA, trackB) => {
      function sortArtists(
        artistA: SimplifiedArtist,
        artistB: SimplifiedArtist,
      ) {
        const key = (artist: SimplifiedArtist) => artist.name.toLowerCase();
        const keyA = key(artistA);
        const keyB = key(artistB);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      }
      const key = {
        [TracksSortingColumn.AddedAt]: () => 0, // default
        [TracksSortingColumn.Album]: (track: PlaylistTrack) =>
          track.track.album.name.toLowerCase(),
        [TracksSortingColumn.Artists]: (track: PlaylistTrack) =>
          track.track.artists.sort(sortArtists)[0]?.name.toLowerCase() ?? 0,
        [TracksSortingColumn.Name]: (track: PlaylistTrack) =>
          track.track.name.toLowerCase(),
      }[sortingColumn];

      const keyA = key(trackA);
      const keyB = key(trackB);

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
}
