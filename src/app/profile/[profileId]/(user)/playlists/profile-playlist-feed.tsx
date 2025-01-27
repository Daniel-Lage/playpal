"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import {
  type Playlist,
  PlaylistFeedStyle,
  PlaylistFeedStyleOptions,
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
} from "~/models/playlist.model";
import { SpotifyLink } from "~/app/_components/spotify-link";

export default function ProfilePlaylistFeed({
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
    const temp = [...playlists]
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

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [playlists, filter, sortingColumn, reversed]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 p-2 text-center text-sm">
            <div className="font-bold">Sorting column</div>
            <select
              onChange={(e) => {
                setSortingColumn(e.target.value as PlaylistsSortingColumn);
              }}
              defaultValue={sortingColumn ?? PlaylistsSortingColumn.CreatedAt}
            >
              {PlaylistsSortingColumnOptions.map((sortingColumn) => (
                <option key={sortingColumn}>{sortingColumn}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setReversed((prev) => !prev);
            }}
          >
            <Image
              height={32}
              width={32}
              src="/direction.png"
              alt="direction icon"
              className={reversed ? "rotate-180" : ""}
            />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 p-2 text-center text-sm">
          <div className="font-bold">Feed Style</div>
          <select
            onChange={(e) => {
              setFeedStyle(e.target.value as PlaylistFeedStyle);
            }}
            defaultValue={sortingColumn ?? PlaylistFeedStyle.Compact}
          >
            {PlaylistFeedStyleOptions.map((PlaylistFeedStyle) => (
              <option key={PlaylistFeedStyle}>{PlaylistFeedStyle}</option>
            ))}
          </select>
        </div>

        <div className="font-bold">{treatedPlaylists.length} Playlists</div>

        <input
          placeholder="Search something!"
          className="grow bg-transparent placeholder-zinc-600 outline-none"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <PlaylistFeed
        treatedPlaylists={treatedPlaylists}
        style={feedStyle ?? PlaylistFeedStyle.Grid}
      />
    </div>
  );
}

function PlaylistFeed({
  treatedPlaylists,
  style,
}: {
  treatedPlaylists: Playlist[];
  style: PlaylistFeedStyle;
}) {
  if (style === PlaylistFeedStyle.Compact)
    return (
      <div className="flex flex-col gap-2">
        {treatedPlaylists.map((playlist) => (
          <PlaylistCompact key={playlist.id} playlist={playlist} />
        ))}
      </div>
    );

  if (style === PlaylistFeedStyle.Row)
    return (
      <div className="flex flex-col gap-2">
        {treatedPlaylists.map((playlist) => (
          <PlaylistRow key={playlist.id} playlist={playlist} />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-2 px-2 pt-0 md:grid-cols-4 md:gap-4">
      {treatedPlaylists.map((playlist) => (
        <PlaylistGrid key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

function PlaylistGrid({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex flex-col items-end justify-between rounded-xl bg-secondary p-2">
      <Link
        href={`/profile/${playlist.owner.id}/playlist/${playlist.id}`}
        className="grow"
        title={playlist.name}
      >
        <Image
          width={500}
          height={500}
          className="aspect-square rounded-lg"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />

        <div className="px-2 pt-2 text-center font-bold">{playlist.name}</div>
      </Link>
      <SpotifyLink size={20} external_url={playlist.external_urls.spotify} />
    </div>
  );
}

function PlaylistCompact({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden bg-secondary p-1 font-bold md:rounded-lg">
      <Link
        href={`/profile/${playlist.owner.id}/playlist/${playlist.id}`}
        className="grow"
        title={playlist.name}
      >
        <div className="grow overflow-hidden">
          <div className="flex grow overflow-hidden">
            <div className="w-full truncate text-left md:w-1/2">
              {playlist.name}
            </div>
            <div className="w-0 truncate text-left md:w-1/2">
              {playlist.owner.display_name}
            </div>
          </div>
        </div>
      </Link>

      <SpotifyLink size={20} external_url={playlist.external_urls.spotify} />
    </div>
  );
}

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex items-start gap-2 bg-secondary p-2 font-bold md:rounded-lg">
      <Link
        href={`/profile/${playlist.owner.id}/playlist/${playlist.id}`}
        className="flex grow gap-2"
        title={playlist.name}
      >
        <Image
          width={100}
          height={100}
          className="aspect-square rounded-md"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />

        <div className="grow overflow-hidden">
          <div className="flex grow overflow-hidden">
            <div className="w-full truncate text-left text-xl md:w-1/2 md:text-2xl">
              {playlist.name}
            </div>
          </div>
          <div className="truncate text-left text-sm">
            Playlist - {playlist.owner.display_name} - {playlist.tracks.total}{" "}
            tracks
          </div>
        </div>
      </Link>

      <SpotifyLink size={32} external_url={playlist.external_urls.spotify} />
    </div>
  );
}
