"use client";
import { useState, useMemo } from "react";
import { useCookies } from "~/hooks/use-cookies";
import { type PlaylistTrack, TracksSortingColumn } from "~/models/track.model";
import type { SimplifiedArtist } from "~/models/artist.model";
import {
  parseBooleanCookie,
  parseTracksSortingColumnCookie,
} from "~/helpers/parse-cookie";
import {
  stringifyBooleanCookie,
  stringifyTracksSortingColumnCookie,
} from "~/helpers/stringify-cookie";
import { PlaylistSearch } from "../playlist-search";
import { PlaylistTracks } from "../playlist-tracks";

export function PlaylistTracksView({
  tracks,
  sessionUserId,
  playTrack,
  disabled,
  initialReversed,
  initialSortingColumn,
}: {
  tracks: PlaylistTrack[];
  sessionUserId?: string;
  disabled: boolean;
  playTrack: (track: PlaylistTrack) => void;

  initialReversed: boolean;
  initialSortingColumn: TracksSortingColumn;
}) {
  const cookiePrefix = sessionUserId ? `playpal.${sessionUserId}:` : "playpal.";

  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useCookies<boolean>(
    `${cookiePrefix}tracks_reversed`,
    initialReversed,
    parseBooleanCookie,
    stringifyBooleanCookie,
  );

  const [sortingColumn, setSortingColumn] = useCookies<TracksSortingColumn>(
    `${cookiePrefix}tracks_sorting_column`,
    initialSortingColumn,
    parseTracksSortingColumnCookie,
    stringifyTracksSortingColumnCookie,
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
