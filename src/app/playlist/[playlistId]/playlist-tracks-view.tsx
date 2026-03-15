"use client";
import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import type { PlaylistObject } from "~/models/playlist.model";
import { PlayTracksStatus } from "~/models/status.model";
import {
  type PlaylistTrack,
  TracksSortingColumn,
  TracksSortingColumnOptions,
} from "~/models/track.model";
import { PlaylistSearch } from "./playlist-search";
import { PlaylistTracks } from "./playlist-tracks";
import { PopupType, PopupView } from "~/components/popup-view";
import { Check, SearchX, X } from "lucide-react";
import type { SimplifiedArtist } from "~/models/artist.model";

export function PlaylistTracksView({
  playlist,
  tracks,
  sessionUserId,
  status,
  playTrack,
}: {
  playlist: PlaylistObject;
  tracks: PlaylistTrack[];
  sessionUserId?: string;
  status: PlayTracksStatus;
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
        count={playlist.totalTracks}
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
        disabled={status === PlayTracksStatus.Active}
        playTrack={playTrack}
      />

      {status !== PlayTracksStatus.Active &&
        status !== PlayTracksStatus.Inactive && (
          <StatusMessage status={status} />
        )}
    </>
  );
}

function StatusMessage({ status }: { status: PlayTracksStatus }) {
  if (status === PlayTracksStatus.Success)
    return (
      <PopupView type={PopupType.Success}>
        <Check size={40} />
        Playing Tracks Successfully
      </PopupView>
    );

  if (status === PlayTracksStatus.NoDevice)
    return (
      <PopupView type={PopupType.UserError}>
        <SearchX size={40} />
        Spotify Device Not Found
      </PopupView>
    );

  return (
    <PopupView type={PopupType.ServerError}>
      <X size={40} />
      Internal Server Error
    </PopupView>
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
