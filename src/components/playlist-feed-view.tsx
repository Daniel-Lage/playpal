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
import { ItemsView } from "./items-view";
import Image from "next/image";
import { SpotifyLink } from "./spotify-link";
import type { SessionUser } from "~/models/user.model";
import Link from "next/link";

export default function PlaylistFeedView({
  playlists,
  isOwnFeed = false,
  sessionUser,
}: {
  playlists: PlaylistObject[];
  sessionUser?: SessionUser;

  isOwnFeed?: boolean;
}) {
  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useLocalStorage<boolean>(
    sessionUser?.id
      ? `${sessionUser?.id}:playlists_reversed`
      : "playlists_reversed",
    false,
    useCallback((text) => text === "true", []),
    useCallback((value) => (value ? "true" : "false"), []),
  );

  const [sortingColumn, setSortingColumn] =
    useLocalStorage<PlaylistsSortingColumn>(
      sessionUser?.id
        ? `${sessionUser?.id}:playlists_sorting_column`
        : "playlists_sorting_column",
      PlaylistsSortingColumn.CreatedAt,
      useCallback((text) => {
        if (PlaylistsSortingColumnOptions.some((psco) => psco === text))
          return text as PlaylistsSortingColumn;
        return null;
      }, []),
      useCallback((psc) => psc, []),
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
      <div className="flex flex-col items-start gap-2 border-b p-2 md:flex-row md:items-center">
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
      <ItemsView>
        {isOwnFeed && (
          <div className="flex flex-col rounded-md border p-1 md:gap-2 md:p-2">
            <div className="flex items-start gap-2 font-bold">
              <Link
                href={`/liked-songs`}
                className="flex grow gap-2 overflow-x-hidden"
                title="Liked Songs"
              >
                <Image
                  width={96}
                  height={96}
                  className="inline aspect-square h-16 w-16 flex-shrink-0 flex-grow-0 rounded-md md:h-24 md:w-24"
                  src="/liked-songs.jpg"
                  alt="Liked Songs"
                />

                <div className="flex h-full grow flex-col items-start truncate">
                  <div className="flex items-center justify-between text-wrap font-bold">
                    <span className="truncate text-base md:text-xl">
                      Liked Songs
                    </span>
                  </div>
                  <div className="inline items-center text-xs font-bold text-muted-foreground md:text-sm">
                    {sessionUser?.name}
                  </div>
                </div>
              </Link>

              <SpotifyLink external_url="https://open.spotify.com/collection/tracks" />
            </div>
          </div>
        )}

        {treatedPlaylists.map((playlist) => (
          <PlaylistView
            key={playlist.id}
            playlist={playlist}
            sessionUserId={sessionUser?.id}
          />
        ))}
      </ItemsView>
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
