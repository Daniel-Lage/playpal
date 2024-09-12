"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { Logo } from "~/app/_components/logo";
import { deleteUser } from "~/server/queries";
import { getMyPlaylists, getPlaylists } from "~/api/calls";

import type { User } from "next-auth";

import {
  PlaylistFeedStyleOptions,
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
  PlaylistFeedStyle,
  type Playlist,
} from "~/models/playlist.model";
import type { PostObject } from "~/models/post.model";
import { SpotifyLink } from "../_components/spotify-link";
import { Post } from "../_components/post";

export function ProfileView({
  userId,
  user,
  posts,
}: {
  userId: string | null;
  user: User;
  posts: PostObject[];
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [showPosts, setShowPosts] = useState<boolean | undefined>();

  const [sortingColumn, setSortingColumn] = useState<
    PlaylistsSortingColumn | undefined
  >();

  const [reversed, setReversed] = useState<boolean | undefined>();

  const [feedStyle, setFeedStyle] = useState<PlaylistFeedStyle | undefined>();

  useEffect(() => {
    if (showPosts !== undefined && userId) {
      localStorage.setItem(`${userId}:showPosts`, showPosts.toString());
    }
  }, [showPosts, userId]);

  useEffect(() => {
    if (sortingColumn !== undefined && userId) {
      localStorage.setItem(`${userId}:playlists_sorting_column`, sortingColumn);
    }
  }, [sortingColumn, userId]);

  useEffect(() => {
    if (reversed !== undefined && userId) {
      localStorage.setItem(`${userId}:reversed`, reversed.toString());
    }
  }, [reversed, userId]);

  useEffect(() => {
    if (feedStyle !== undefined && userId) {
      localStorage.setItem(`${userId}:playlists_feed_style`, feedStyle);
    }
  }, [feedStyle, userId]);

  const [filter, setFilter] = useState("");

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

  useEffect(() => {
    setShowPosts(localStorage.getItem(`${userId}:showPosts`) !== "false");
    setSortingColumn(
      (localStorage.getItem(
        `${userId}:playlists_sorting_column`,
      ) as PlaylistsSortingColumn) ?? PlaylistsSortingColumn.CreatedAt,
    );
    setReversed(localStorage.getItem(`${userId}:reversed`) === "true");
    setFeedStyle(
      (localStorage.getItem(
        `${userId}:playlists_feed_style`,
      ) as PlaylistFeedStyle) ?? PlaylistFeedStyle.Simple,
    );

    if (userId === user.id) {
      getMyPlaylists(userId)
        .then((value) => setPlaylists(value))
        .catch(console.error);
    } else {
      getPlaylists(userId, user.providerAccountId)
        .then((value) => setPlaylists(value))
        .catch(console.error);
    }
  }, [user, userId]);

  if (!user?.image || !user?.name) return <SignInButton />;

  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden bg-main md:rounded-xl">
        <div className="flex items-center gap-2 p-2">
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={user.image}
            alt={user.name}
          />
          <div className="grow px-2 font-bold">{user.name}</div>

          <SpotifyLink
            size={32}
            external_url={`https://open.spotify.com/user/${user.providerAccountId}`}
          />

          {userId === user.id && (
            <>
              <Link href="/" onClick={() => deleteUser(userId)}>
                <Image
                  height={32}
                  width={32}
                  src="/trash.png"
                  alt="trash icon"
                />
              </Link>
              <Link href="/api/auth/signout">
                <Image height={32} width={32} src="/exit.png" alt="exit icon" />
              </Link>
            </>
          )}
          <Logo />
        </div>

        <div className="flex flex-col bg-main2">
          <div className="flex font-bold">
            {showPosts !== false ? (
              <>
                <div className="flex w-1/2 justify-center bg-main3 p-1">
                  Posts
                </div>
                <button
                  className="flex w-1/2 justify-center bg-main p-1"
                  onClick={() => setShowPosts(false)}
                >
                  Playlists
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex w-1/2 justify-center bg-main p-1"
                  onClick={() => setShowPosts(true)}
                >
                  Posts
                </button>
                <div className="flex w-1/2 justify-center bg-main3 p-1">
                  Playlists
                </div>
              </>
            )}
          </div>
          {showPosts !== false ? (
            userId === user.id && (
              <div className="flex p-2">
                <PostCreator userId={userId} />
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2 p-2 md:flex-row">
              <div className="flex items-start gap-2">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 p-2 text-center text-sm">
                  <div className="font-bold">Sorting column</div>
                  <select
                    onChange={(e) => {
                      setSortingColumn(
                        e.target.value as PlaylistsSortingColumn,
                      );
                    }}
                    defaultValue={
                      sortingColumn ?? PlaylistsSortingColumn.CreatedAt
                    }
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

              <div className="flex items-center justify-center gap-2 self-start rounded-xl bg-main3 p-2 text-center text-sm">
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

              <input
                placeholder="Search something!"
                className="grow bg-transparent placeholder-zinc-600 outline-none"
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {showPosts !== false ? (
        posts.map((post) => <Post key={post.id} post={post} userId={userId} />)
      ) : (
        <PlaylistFeed
          treatedPlaylists={treatedPlaylists}
          style={feedStyle ?? PlaylistFeedStyle.Simple}
        />
      )}
    </>
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

  if (style === PlaylistFeedStyle.Detailed)
    return (
      <div className="flex flex-col gap-2">
        {treatedPlaylists.map((playlist) => (
          <PlaylistDetailed key={playlist.id} playlist={playlist} />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-2 p-2 pt-0 md:grid-cols-4 md:gap-4">
      {treatedPlaylists.map((playlist) => (
        <PlaylistSimple key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

function PlaylistSimple({ playlist }: { playlist: Playlist }) {
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
          className="rounded-lg"
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

function PlaylistDetailed({ playlist }: { playlist: Playlist }) {
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
          className="rounded-md"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />

        <div className="grow overflow-hidden">
          <div className="flex grow overflow-hidden">
            <div className="w-full truncate text-left text-xl md:w-1/2 md:text-2xl">
              {playlist.name}
            </div>
            <div className="w-0 truncate text-left md:w-1/2">
              {playlist.tracks.total} tracks
            </div>
          </div>
          <div className="truncate text-left text-sm">
            {playlist.owner.display_name}
          </div>
        </div>
      </Link>

      <SpotifyLink size={32} external_url={playlist.external_urls.spotify} />
    </div>
  );
}
