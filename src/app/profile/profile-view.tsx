"use client";

import type { Session, User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "~/app/_components/signin-button";
import { Logo } from "~/app/_components/logo";
import { useEffect, useMemo, useState } from "react";
import type { Playlist, playlistsSortingColumn } from "~/api/types";
import { getPlaylists, getSpotifyUser } from "~/api/calls";
import type { PostObject } from "~/server/types";
import { getUsersPosts } from "~/server/queries";
import { Post } from "~/app/_components/post";
import { PostCreator } from "~/app/_components/post-creator";

export function ProfileView({
  session,
  user,
}: {
  session: Session;
  user?: User;
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [posts, setPosts] = useState<PostObject[]>([]);

  const initialShowPosts =
    window.localStorage.getItem(
      `${session.user.providerAccountId}:show_posts`,
    ) === "true";

  const [showPosts, setShowPosts] = useState(initialShowPosts);

  useEffect(() => {
    window.localStorage.setItem(
      `${session.user.providerAccountId}:show_posts`,
      showPosts.toString(),
    );
  }, [showPosts, session]);

  const initialSortingColumn = (window.localStorage.getItem(
    `${session.user.providerAccountId}:playlists_sorting_column`,
  ) ?? "Created at") as playlistsSortingColumn;

  const [sortingColumn, setSortingColumn] = useState(initialSortingColumn);

  useEffect(() => {
    window.localStorage.setItem(
      `${session.user.providerAccountId}:playlists_sorting_column`,
      sortingColumn,
    );
  }, [sortingColumn, session]);

  const initialReversed =
    window.localStorage.getItem(
      `${session.user.providerAccountId}:playlists_reversed`,
    ) === "true";

  const [reversed, setReversed] = useState(initialReversed);

  useEffect(() => {
    window.localStorage.setItem(
      `${session.user.providerAccountId}:playlists_reversed`,
      reversed.toString(),
    );
  }, [reversed, session]);

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

        if (sortingColumn === "Name") {
          keyA = playlistA.name.toLowerCase();
          keyB = playlistB.name.toLowerCase();
        }

        if (sortingColumn === "Owner") {
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
    if (user) {
      getSpotifyUser(session.user.id, user.providerAccountId)
        .then((value) => console.log(value))
        .catch(console.error);

      getPlaylists(session.user.id, user.providerAccountId)
        .then((value) => setPlaylists(value))
        .catch(console.error);

      getUsersPosts(user.id)
        .then((value) => setPosts(value))
        .catch(console.error);
    } else {
      getSpotifyUser(session.user.id)
        .then((value) => console.log(value))
        .catch(console.error);

      getPlaylists(session.user.id)
        .then((value) => setPlaylists(value))
        .catch(console.error);

      getUsersPosts(session.user.id)
        .then((value) => setPosts(value))
        .catch(console.error);
    }
  }, [session, user]);

  if (!session?.user?.image || !session?.user?.name) return <SignInButton />;

  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden bg-main1 md:rounded-xl">
        <div className="flex items-center gap-2 p-2">
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={session.user.image}
            alt={session.user.name}
          />
          <div className="grow px-2 font-bold">{session.user.name}</div>
          <Logo />

          <Link href="/api/auth/signout">
            <Image height={32} width={32} src="/exit.png" alt="exit icon" />
          </Link>
        </div>
        <div className="flex flex-col bg-main2">
          <div className="flex font-bold">
            {showPosts ? (
              <>
                <div className="flex w-1/2 justify-center bg-main3 p-1">
                  Posts
                </div>
                <button
                  className="flex w-1/2 justify-center bg-main1 p-1"
                  onClick={() => setShowPosts(false)}
                >
                  Playlists
                </button>
              </>
            ) : (
              <>
                <button
                  className="flex w-1/2 justify-center bg-main1 p-1"
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
          {showPosts ? (
            !user && (
              <div className="flex p-2">
                <PostCreator session={session} />
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2 p-2 md:flex-row">
              <div className="flex gap-2">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 pl-1 pr-3 text-center text-sm">
                  <div className="font-bold">Sorting column</div>
                  <div className="flex">
                    <select
                      onChange={(e) => {
                        setSortingColumn(
                          e.target.value as playlistsSortingColumn,
                        );
                      }}
                      defaultValue={initialSortingColumn}
                    >
                      {["Created at", "Name", "Owner"].map((sortingColumn) => (
                        <option key={sortingColumn}>{sortingColumn}</option>
                      ))}
                    </select>
                  </div>
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

      {showPosts ? (
        posts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <div className="grid grid-cols-2 gap-2 p-2 pt-0 md:grid-cols-4 md:gap-4">
          {treatedPlaylists.map((playlist) => (
            <Link
              href={`/playlist/${playlist.id}`}
              key={playlist.id}
              className="flex flex-col items-center overflow-hidden rounded-2xl bg-secondary"
            >
              <Image
                width={500}
                height={500}
                className="aspect-square"
                src={playlist.images[0]?.url ?? ""}
                alt={playlist.name}
              />

              <div className="h-16 px-2 pt-2 text-center">{playlist.name}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
