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
import { useRouter } from "next/navigation";

export function PlaylistView({
  playlist,
  // userId, // to know if the playlist is yours?
  sessionUserId,
  play,
}: {
  // userId: string;
  playlist: Playlist;
  sessionUserId?: string;
  play?: (start?: PlaylistTrack) => Promise<void>;
}) {
  const router = useRouter();

  const [disabled, setDisabled] = useState(false);

  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUserId ? `${sessionUserId}:tracks_reversed` : "tracks_reversed",
    false,
    (text) => text === "true",
    (value) => (value ? "true" : "false"),
  );
  const [sortingColumn, setSortingColumn] =
    useLocalStorage<TracksSortingColumn>(
      sessionUserId
        ? `${sessionUserId}:tracks_sorting_column`
        : "tracks_sorting_column",
      TracksSortingColumn.AddedAt,
      (text) => {
        if (TracksSortingColumnOptions.some((tsco) => tsco === text))
          return text as TracksSortingColumn;
        return null;
      },
      (tsc) => tsc, // already is text so no conversion is needed
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
      if (!sessionUserId) return router.replace("/api/auth/signin");
      if (!play) return;

      setDisabled(true);

      await play(start);

      setDisabled(false);
    },
    [play, router, sessionUserId],
  );

  return (
    <>
      <div className="flex flex-col overflow-hidden md:rounded-md">
        <PlaylistContent playlist={playlist} />

        <PlaylistSearch
          sortingColumn={sortingColumn}
          reversed={reversed}
          filter={filter}
          disabled={disabled}
          sortColumn={(e) => {
            setSortingColumn(e.target.value as TracksSortingColumn);
          }}
          reverse={() => {
            setReversed((prev) => !prev);
          }}
          filterTracks={(e) => setFilter(e.target.value)}
          play={handlePlay}
        />
      </div>

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
      let keyA = "";
      let keyB = "";

      if (sortingColumn === TracksSortingColumn.Name) {
        keyA = trackA.track.name.toLowerCase();
        keyB = trackB.track.name.toLowerCase();
      }

      if (sortingColumn === TracksSortingColumn.Album) {
        keyA = trackA.track.album.name.toLowerCase();
        keyB = trackB.track.album.name.toLowerCase();
      }

      if (sortingColumn === TracksSortingColumn.Artists) {
        function getHighestArtist(
          artistA: SimplifiedArtist,
          artistB: SimplifiedArtist,
        ) {
          const keyA = artistA.name.toLowerCase();
          const keyB = artistB.name.toLowerCase();
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        }

        const artistA =
          trackA.track.artists.length === 1
            ? trackA.track.artists[0]
            : trackA.track.artists.sort(getHighestArtist)[0];

        const artistB =
          trackB.track.artists.length === 1
            ? trackB.track.artists[0]
            : trackB.track.artists.sort(getHighestArtist)[0];

        if (!artistA) return 0;
        if (!artistB) return 0;

        keyA = artistA.name.toLowerCase();
        keyB = artistB.name.toLowerCase();
      }

      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
}
