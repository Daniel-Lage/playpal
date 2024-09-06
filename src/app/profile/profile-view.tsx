"use client";

import type { Session, User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "~/app/_components/signin-button";
import { Logo } from "~/app/_components/logo";
import { useEffect, useMemo, useState } from "react";
import type { Playlist, playlistsSortingColumn } from "~/api/types";
import {
  getMyPlaylists,
  getMySpotifyUser,
  getPlaylists,
  getSpotifyUser,
} from "~/api/calls";
import type { PostObject } from "~/server/types";
import { Post } from "~/app/_components/post";
import { PostCreator } from "~/app/_components/post-creator";
import { deleteUser } from "~/server/queries";

export function ProfileView({
  session,
  user,
  posts,
}: {
  session: Session;
  user: User;
  posts: PostObject[];
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const [showPosts, setShowPosts] = useState<boolean | undefined>();

  const [sortingColumn, setSortingColumn] = useState<
    playlistsSortingColumn | undefined
  >();

  const [reversed, setReversed] = useState<boolean | undefined>();

  const SUPAID = useMemo(() => session?.user.providerAccountId, [session]);

  useEffect(() => {
    if (showPosts !== undefined) {
      localStorage.setItem(`${SUPAID}:showPosts`, showPosts.toString());
    }
  }, [showPosts, SUPAID]);

  useEffect(() => {
    if (sortingColumn !== undefined) {
      localStorage.setItem(`${SUPAID}:sortingColumn`, sortingColumn);
    }
  }, [sortingColumn, SUPAID]);

  useEffect(() => {
    if (reversed !== undefined) {
      localStorage.setItem(`${SUPAID}:reversed`, reversed.toString());
    }
  }, [reversed, SUPAID]);

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
    setShowPosts(localStorage.getItem(`${SUPAID}:showPosts`) !== "false");
    setSortingColumn(
      localStorage.getItem(`${SUPAID}:sortingColumn`) as playlistsSortingColumn,
    );
    setReversed(localStorage.getItem(`${SUPAID}:reversed`) === "true");

    if (session?.user?.providerAccountId === user.providerAccountId) {
      getMySpotifyUser(session.user.id)
        .then((value) => console.log(value, user))
        .catch(console.error);

      getMyPlaylists(session.user.id)
        .then((value) => setPlaylists(value))
        .catch(console.error);
    } else {
      getSpotifyUser(session.user.id, user.providerAccountId)
        .then((value) => console.log(value, user))
        .catch(console.error);

      getPlaylists(session.user.id, user.providerAccountId)
        .then((value) => setPlaylists(value))
        .catch(console.error);
    }
  }, [session, user, SUPAID]);

  if (!user?.image || !user?.name) return <SignInButton />;

  return (
    <>
      <div className="flex flex-col gap-2 overflow-hidden bg-main1 md:rounded-xl">
        <div className="flex items-center gap-2 p-2">
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={user.image}
            alt={user.name}
          />
          <div className="grow px-2 font-bold">{user.name}</div>
          <Logo />

          {session?.user?.providerAccountId === user.providerAccountId && (
            <>
              <Link href="/" onClick={() => deleteUser(session.user.id)}>
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
        </div>

        <div className="flex flex-col bg-main2">
          <div className="flex font-bold">
            {showPosts !== false ? (
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
          {showPosts !== false ? (
            session?.user?.providerAccountId === user.providerAccountId && (
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
                      defaultValue={sortingColumn ?? "Created at"}
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

      {showPosts !== false ? (
        posts.map((post) => (
          <Post key={post.id} post={post} session={session} />
        ))
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
