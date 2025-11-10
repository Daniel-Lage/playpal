"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import type { PlaylistObject } from "~/models/playlist.model";
import {
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
} from "~/models/playlist.model";
import { PlaylistView } from "./playlist-view";
import { Sorter } from "~/components/sorter";
import { SearchView } from "~/components/search-view";
import { MainContentView } from "./main-content-view";

export default function PlaylistsView({
  playlists,
  sessionUserId,
}: {
  playlists: PlaylistObject[];
  sessionUserId?: string;
}) {
  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUserId
      ? `${sessionUserId}:playlists_reversed`
      : "playlists_reversed",
    false,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [sortingColumn, setSortingColumn] =
    useLocalStorage<PlaylistsSortingColumn>(
      sessionUserId
        ? `${sessionUserId}:playlists_sorting_column`
        : "playlists_sorting_column",
      PlaylistsSortingColumn.CreatedAt,
      useCallback((text) => {
        if (PlaylistsSortingColumnOptions.some((psco) => psco === text))
          return text as PlaylistsSortingColumn;
        return null;
      }, []),
      useCallback((psc) => psc, []), // already is text so no conversion is needed
    );

  const treatedPlaylists = useMemo(() => {
    const temp = getTreatedPlaylists([...playlists], sortingColumn, filter);

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [playlists, filter, sortingColumn, reversed]);

  return (
    <>
      <div className="flex flex-col items-start gap-2 border-b-2 border-background bg-primary p-2 md:flex-row md:items-center md:px-[calc(19vw_+_16px)]">
        {playlists.length} Playlists
        <Sorter
          title="Sort by"
          onSelect={(value: string) =>
            setSortingColumn(value as PlaylistsSortingColumn)
          }
          value={sortingColumn ?? PlaylistsSortingColumn.CreatedAt}
          options={PlaylistsSortingColumnOptions}
          reversed={reversed}
          reverse={() => {
            setReversed((prev) => !prev);
          }}
        />
        <SearchView
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <MainContentView>
        {treatedPlaylists.map((playlist) => (
          <PlaylistView
            key={playlist.id}
            playlist={playlist}
            sessionUserId={sessionUserId}
          />
        ))}
      </MainContentView>
    </>
  );
}

function getTreatedPlaylists(
  playlists: PlaylistObject[],
  sortingColumn: PlaylistsSortingColumn,
  filter: string,
) {
  return playlists
    .filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(filter.toLowerCase()) ||
        playlist.owner.name?.toLowerCase().includes(filter.toLowerCase()),
    )
    .sort((playlistA, playlistB) => {
      const key = {
        [PlaylistsSortingColumn.CreatedAt]: () => 0, // default
        [PlaylistsSortingColumn.Length]: (playlist: PlaylistObject) =>
          -playlist.totalTracks,
        [PlaylistsSortingColumn.Name]: (playlist: PlaylistObject) =>
          playlist.name.toLowerCase(),
        [PlaylistsSortingColumn.Likes]: (playlist: PlaylistObject) =>
          playlist.likes ?? 0,
        [PlaylistsSortingColumn.Replies]: (playlist: PlaylistObject) =>
          playlist.replies ?? 0,
      }[sortingColumn];

      const keyA = key(playlistA);
      const keyB = key(playlistB);

      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
}
