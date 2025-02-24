"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import {
  type Playlist,
  PlaylistFeedStyle,
  PlaylistFeedStyleOptions,
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
} from "~/models/playlist.model";
import { PlaylistFeed } from "./playlists-feed";
import { PlaylistsSearch } from "./playlists-search";

export default function PlaylistsView({
  playlists,
  sessionUserId,
}: {
  playlists: Playlist[];
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

  const [feedStyle, setFeedStyle] = useLocalStorage<PlaylistFeedStyle>(
    sessionUserId
      ? `${sessionUserId}:playlists_feed_style`
      : "playlists_feed_style",
    PlaylistFeedStyle.Grid,
    useCallback((text) => {
      if (PlaylistFeedStyleOptions.some((pfso) => pfso === text))
        return text as PlaylistFeedStyle;
      return null;
    }, []),
    useCallback((pfs) => pfs, []), // already is text so no conversion is needed
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
      <PlaylistsSearch
        sortingColumn={sortingColumn}
        reversed={reversed}
        filter={filter}
        sortColumn={(e) => {
          setSortingColumn(e.target.value as PlaylistsSortingColumn);
        }}
        reverse={() => {
          setReversed((prev) => !prev);
        }}
        filterPlaylists={(e) => setFilter(e.target.value)}
        length={playlists.length}
        changeStyle={(e) => {
          setFeedStyle(e.target.value as PlaylistFeedStyle);
        }}
      />

      <PlaylistFeed
        treatedPlaylists={treatedPlaylists}
        style={feedStyle ?? PlaylistFeedStyle.Grid}
      />
    </>
  );
}

function getTreatedPlaylists(
  playlists: Playlist[],
  sortingColumn: PlaylistsSortingColumn,
  filter: string,
) {
  return playlists
    .filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(filter.toLowerCase()) ||
        playlist.owner.display_name
          .toLowerCase()
          .includes(filter.toLowerCase()),
    )
    .sort((playlistA, playlistB) => {
      const key = {
        [PlaylistsSortingColumn.CreatedAt]: () => 0, // default
        [PlaylistsSortingColumn.Length]: (p: Playlist) => -p.tracks.total,
        [PlaylistsSortingColumn.Name]: (p: Playlist) => p.name.toLowerCase(),
      }[sortingColumn];

      if (key(playlistA) < key(playlistB)) return -1;
      if (key(playlistA) > key(playlistB)) return 1;
      return 0;
    });
}
