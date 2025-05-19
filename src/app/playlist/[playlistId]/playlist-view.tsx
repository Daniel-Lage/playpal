"use client";

import { useCallback, useMemo, useState } from "react";

import {
  TracksSortingColumnOptions,
  TracksSortingColumn,
  type PlaylistTrack,
} from "~/models/track.model";

import type { SimplifiedArtist } from "~/models/artist.model";
import { type Playlist } from "~/models/playlist.model";
import { PlaylistContent } from "./playlist-content";
import { PlaylistSearch } from "./playlist-search";
import { PlaylistTracks } from "./playlist-tracks";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { signIn } from "next-auth/react";

export function PlaylistView({
  playlist,
  // userId, // to know if the playlist is yours?
  sessionUserId,
  play,
  expires_at,
}: {
  // userId: string;
  playlist: Playlist;
  sessionUserId?: string;
  play?: (expired: boolean, start?: PlaylistTrack) => Promise<void>;
  expires_at?: number | null;
}) {
  const [disabled, setDisabled] = useState(false);

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
      useCallback((tsc) => tsc, []), // already is text so no conversion is needed
    );

  const treatedTracks = useMemo(() => {
    const temp = getTreatedTracks(
      [...playlist.tracks.items],
      sortingColumn,
      filter,
    );

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [playlist, filter, sortingColumn, reversed]);

  const handlePlay = useCallback(
    async (start?: PlaylistTrack) => {
      if (!sessionUserId) return signIn("spotify");
      if (!play || !expires_at) return;

      setDisabled(true);

      await play(expires_at < Math.floor(new Date().getTime() / 1000), start);

      setDisabled(false);
    },
    [expires_at, play, sessionUserId],
  );

  return (
    <>
      <PlaylistContent playlist={playlist} />

      <PlaylistSearch
        sortingColumn={sortingColumn}
        reversed={reversed}
        filter={filter}
        disabled={disabled}
        sortColumn={(value: string) =>
          setSortingColumn(value as TracksSortingColumn)
        }
        reverse={() => {
          setReversed((prev) => !prev);
        }}
        filterTracks={(e) => setFilter(e.target.value)}
        play={handlePlay}
      />

      <PlaylistTracks
        treatedTracks={treatedTracks}
        disabled={disabled}
        playTrack={handlePlay}
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
        const keyA = artistA.name.toLowerCase();
        const keyB = artistB.name.toLowerCase();
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      }
      const key = {
        [TracksSortingColumn.AddedAt]: () => 0, // default
        [TracksSortingColumn.Album]: (t: PlaylistTrack) =>
          t.track.album.name.toLowerCase(),
        [TracksSortingColumn.Artists]: (t: PlaylistTrack) =>
          t.track.artists.sort(sortArtists)[0]?.name.toLowerCase() ?? 0,
        [TracksSortingColumn.Name]: (t: PlaylistTrack) =>
          t.track.name.toLowerCase(),
      }[sortingColumn];

      if (key(trackA) < key(trackB)) return -1;
      if (key(trackA) > key(trackB)) return 1;
      return 0;
    });
}
