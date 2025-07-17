"use client";

import { useCallback, useMemo, useState } from "react";

import {
  TracksSortingColumnOptions,
  TracksSortingColumn,
  type PlaylistTrack,
  playTracksStatus,
} from "~/models/track.model";

import type { SimplifiedArtist } from "~/models/artist.model";
import { type Playlist } from "~/models/playlist.model";
import { PlaylistContent } from "./playlist-content";
import { PlaylistSearch } from "./playlist-search";
import { PlaylistTracks } from "./playlist-tracks";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { signIn } from "next-auth/react";
import { Check, SearchX, X } from "lucide-react";
import { setFirstItem } from "~/helpers/set-first-item";

export function PlaylistView({
  playlist,
  // userId, // to know if the playlist is yours?
  sessionUserId,
  play,
  expires_at,
  queue,
}: {
  // userId: string;
  playlist: Playlist;
  queue?: PlaylistTrack[];
  sessionUserId?: string;
  play?: (
    expired: boolean,
    queue: PlaylistTrack[],
  ) => Promise<playTracksStatus>;
  expires_at?: number | null;
}) {
  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUserId ? `${sessionUserId}:tracks_reversed` : "tracks_reversed",
    false,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [shuffled, setShuffled] = useLocalStorage<boolean>(
    sessionUserId ? `${sessionUserId}:play_shuffled` : "play_shuffled",
    true,
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

  const [status, setStatus] = useState<playTracksStatus>(
    playTracksStatus.Inactive,
  );

  const handlePlay = useCallback(
    async (start?: PlaylistTrack) => {
      if (!sessionUserId) return signIn("spotify");
      if (!play || !expires_at || !queue) return;

      setStatus(playTracksStatus.Active);

      if (shuffled)
        setStatus(
          await play(
            expires_at < Math.floor(new Date().getTime() / 1000),
            start
              ? setFirstItem(
                  queue,
                  start,
                  (other) => other.track.uri === start.track.uri,
                )
              : queue,
          ),
        );
      else {
        let newQueue = playlist.tracks.items.filter((track) => !track.is_local);
        const startIndex = start
          ? newQueue.findIndex((other) => other.track.uri === start.track.uri)
          : 0;
        newQueue = newQueue.slice(startIndex, startIndex + 99);
        setStatus(
          await play(
            expires_at < Math.floor(new Date().getTime() / 1000),
            newQueue,
          ),
        );
      }
      setTimeout(() => {
        setStatus(playTracksStatus.Inactive);
      }, 4000);
    },
    [expires_at, play, sessionUserId, shuffled, playlist, queue],
  );

  return (
    <>
      <PlaylistContent playlist={playlist} />

      <PlaylistSearch
        sortingColumn={sortingColumn}
        reversed={reversed}
        filter={filter}
        disabled={status === playTracksStatus.Active}
        sortColumn={(value: string) =>
          setSortingColumn(value as TracksSortingColumn)
        }
        reverse={() => {
          setReversed((prev) => !prev);
        }}
        shuffled={shuffled}
        switchShuffled={() => {
          setShuffled((prev) => !prev);
        }}
        filterTracks={(e) => setFilter(e.target.value)}
        play={handlePlay}
      />

      <PlaylistTracks
        treatedTracks={treatedTracks}
        disabled={status === playTracksStatus.Active}
        playTrack={handlePlay}
      />

      {status !== playTracksStatus.Active &&
        status !== playTracksStatus.Inactive && (
          <StatusMessage status={status} />
        )}
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

function StatusMessage({ status }: { status: playTracksStatus }) {
  if (status === playTracksStatus.Sucess)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-green-500 px-4 py-8 md:w-fit">
          <Check size={40} />
          Playing Tracks Successfully
        </div>
      </div>
    );

  if (status === playTracksStatus.NoDevice)
    return (
      <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
        <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-yellow-500 px-4 py-8 md:w-fit">
          <SearchX size={40} />
          Spotify Device Not Found
        </div>
      </div>
    );

  return (
    <div className="margin-auto popup fixed bottom-20 flex w-full flex-col self-center md:bottom-6">
      <div className="relative flex h-8 w-[90%] items-center justify-center gap-4 self-center rounded-md bg-red-500 px-4 py-8 md:w-fit">
        <X size={40} />
        Internal Server Error
      </div>
    </div>
  );
}
