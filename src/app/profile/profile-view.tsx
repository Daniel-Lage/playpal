"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { Logo } from "~/app/_components/logo";
import { deleteUser, followUser, unfollowUser } from "~/server/queries";
import { getMyPlaylists, getPlaylists } from "~/api/calls";

import {
  PlaylistFeedStyleOptions,
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
  PlaylistFeedStyle,
  type Playlist,
} from "~/models/playlist.model";
import { SpotifyLink } from "../_components/spotify-link";
import { Post } from "../_components/post";
import {
  ProfileTab,
  ProfileTabOptions,
  type UserObject,
} from "~/models/user.model";
import { PostType } from "~/models/post.model";

export function ProfileView({
  userId,
  user,
}: {
  userId: string | null | undefined;
  user: UserObject;
}) {
  const [profileTab, setProfileTab] = useState<ProfileTab | undefined>();

  useEffect(() => {
    if (profileTab !== undefined && userId) {
      localStorage.setItem(`${userId}:profile_tab`, profileTab);
    }
  }, [profileTab, userId]);

  useEffect(() => {
    setProfileTab(
      (localStorage.getItem(`${userId}:profile_tab`) as ProfileTab) ??
        ProfileTab.Posts,
    );
  }, [user, userId]);

  if (!user?.image || !user?.name) return <SignInButton />;

  return (
    <div>
      <div className="flex flex-col gap-2 overflow-hidden bg-main md:rounded-t-xl">
        <div className="flex items-center gap-2 p-2">
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={user.image}
            alt={user.name}
          />
          <div className="grow px-2 font-bold">{user.name}</div>

          <FollowButton userId={userId} user={user} />

          <SpotifyLink
            size={32}
            external_url={`https://open.spotify.com/user/${user.providerAccountId}`}
          />
          <Logo />
        </div>

        <div className="flex gap-2 self-center font-bold">
          <Link href={`/profile/${user.providerAccountId}/followers`}>
            {user.followers.length} Followers
          </Link>
          <Link href={`/profile/${user.providerAccountId}/following`}>
            {user.following.length} Following
          </Link>
        </div>
        <div className="flex flex-col bg-main2">
          <div className="flex font-bold">
            {ProfileTabOptions.map((ProfileTabOption) => (
              <button
                key={ProfileTabOption}
                className={`flex w-1/2 justify-center ${profileTab === ProfileTabOption ? "bg-main" : "bg-main2"} p-1 text-xs md:text-base`}
                onClick={() => setProfileTab(ProfileTabOption)}
              >
                {ProfileTabOption}
              </button>
            ))}
          </div>
          {userId === user.id && profileTab === ProfileTab.Posts && (
            <div className="flex p-2">
              <PostCreator userId={userId} />
            </div>
          )}
        </div>
      </div>
      <ProfileFeed userId={userId} user={user} profileTab={profileTab} />
    </div>
  );
}

function ProfileFeed({
  userId,
  user,
  profileTab,
}: {
  userId: string | null | undefined;
  user: UserObject;
  profileTab: ProfileTab | undefined;
}) {
  const [sortingColumn, setSortingColumn] = useState<
    PlaylistsSortingColumn | undefined
  >();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filter, setFilter] = useState("");

  const [reversed, setReversed] = useState<boolean | undefined>();

  const [feedStyle, setFeedStyle] = useState<PlaylistFeedStyle | undefined>();
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
    if (sortingColumn !== undefined && userId) {
      localStorage.setItem(`${userId}:playlists_sorting_column`, sortingColumn);
    }
  }, [sortingColumn, userId]);

  useEffect(() => {
    if (reversed !== undefined && userId) {
      localStorage.setItem(`${userId}:playlists_reversed`, reversed.toString());
    }
  }, [reversed, userId]);

  useEffect(() => {
    if (feedStyle !== undefined && userId) {
      localStorage.setItem(`${userId}:playlists_feed_style`, feedStyle);
    }
  }, [feedStyle, userId]);

  useEffect(() => {
    setSortingColumn(
      (localStorage.getItem(
        `${userId}:playlists_sorting_column`,
      ) as PlaylistsSortingColumn) ?? PlaylistsSortingColumn.CreatedAt,
    );
    setReversed(
      localStorage.getItem(`${userId}:playlists_reversed`) === "true",
    );
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

  if (profileTab === ProfileTab.Posts) {
    const posts = user.posts.filter((post) => post.type === PostType.Post);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
          <div className="font-bold">{posts.length} Posts</div>
        </div>
        {posts.map((post) => (
          <Post key={post.id} post={post} userId={userId} />
        ))}
      </div>
    );
  }

  if (profileTab === ProfileTab.PostsAndReplies)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
          <div className="font-bold">{user.posts.length} Posts</div>
        </div>
        {user.posts.map((post) => (
          <Post key={post.id} post={post} userId={userId} />
        ))}
      </div>
    );

  if (profileTab === ProfileTab.Likes)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
          <div className="font-bold">{user.likes.length} Likes</div>
        </div>
        {user.likes.map(
          (like) =>
            like?.likee && (
              <Post key={like.likee.id} post={like.likee} userId={userId} />
            ),
        )}
      </div>
    );

  if (profileTab === ProfileTab.Playlists)
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
          style={feedStyle ?? PlaylistFeedStyle.Simple}
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

export function FollowButton({
  userId,
  user,
}: {
  userId: string | null | undefined;
  user: UserObject;
}) {
  if (userId === user.id)
    return (
      <>
        <Link href="/" onClick={() => deleteUser(userId)}>
          <Image height={32} width={32} src="/trash.png" alt="trash icon" />
        </Link>
        <Link href="/api/auth/signout">
          <Image height={32} width={32} src="/exit.png" alt="exit icon" />
        </Link>
      </>
    );

  if (!userId) return;

  if (user.followers.some((follow) => follow.followerId === userId))
    return (
      <button
        onClick={() => {
          void unfollowUser(userId, user.id);
        }}
        className="text-sm font-bold"
      >
        Unfollow
      </button>
    );
  return (
    <button
      onClick={() => {
        void followUser(userId, user.id);
      }}
      className="text-sm font-bold"
    >
      Follow
    </button>
  );
}
