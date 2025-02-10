"use client";

import { useMemo, useState } from "react";
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
    (text) => text === "true",
    (value) => (value ? "true" : "false"),
  );

  const [feedStyle, setFeedStyle] = useLocalStorage<PlaylistFeedStyle>(
    sessionUserId
      ? `${sessionUserId}:playlists_feed_style`
      : "playlists_feed_style",
    PlaylistFeedStyle.Grid,
    (text) => {
      if (PlaylistFeedStyleOptions.some((pfso) => pfso === text))
        return text as PlaylistFeedStyle;
      return null;
    },
    (pfs) => pfs, // already is text so no conversion is needed
  );

  const [sortingColumn, setSortingColumn] =
    useLocalStorage<PlaylistsSortingColumn>(
      sessionUserId
        ? `${sessionUserId}:playlists_sorting_column`
        : "playlists_sorting_column",
      PlaylistsSortingColumn.CreatedAt,
      (text) => {
        if (PlaylistsSortingColumnOptions.some((psco) => psco === text))
          return text as PlaylistsSortingColumn;
        return null;
      },
      (psc) => psc, // already is text so no conversion is needed
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
      let keyA = "";
      let keyB = "";

      if (sortingColumn === PlaylistsSortingColumn.Length) {
        return -playlistA.tracks.total + playlistB.tracks.total;
      }

      if (sortingColumn === PlaylistsSortingColumn.Name) {
        keyA = playlistA.name.toLowerCase();
        keyB = playlistB.name.toLowerCase();
      }

      if (sortingColumn === PlaylistsSortingColumn.Owner) {
        keyA = playlistA.owner.display_name.toLowerCase();
        keyB = playlistB.owner.display_name.toLowerCase();
      }

      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
}
