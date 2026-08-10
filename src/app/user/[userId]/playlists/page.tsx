import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import PlaylistFeedView from "~/components/playlist-feed-view";
import { getPlaylists } from "~/server/get-playlists";
import { PageView } from "~/components/page-view";
import type { PlaylistsSortingColumn } from "~/models/playlist.model";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export async function generateMetadata({
  params: { userId },
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);

  if (!user)
    return {
      title: "PlayPal | Profile",
      openGraph: {
        title: "PlayPal | Profile",
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  if (!user.image)
    return {
      title: `Playpal | ${user.name}`,
      openGraph: {
        title: `Playpal | ${user.name}`,
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  return {
    title: `Playpal | ${user.name}`,
    openGraph: {
      title: `Playpal | ${user.name}`,
      images: [user.image],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/user/${userId}`,
    },
  };
}

export default async function PlaylistsPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  const playlists = await getPlaylists({ userIds: [userId] });
  const preferenceKeyPrefix = session?.user.id ? `${session.user.id}:` : "";
  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}side_bar_collapsed`),
    )?.value === "true";
  const initialPlaylistsReversed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}playlists_reversed`),
    )?.value === "true";
  const initialPlaylistsSortingColumn = cookieStore.get(
    storageKeyToCookieName(`${preferenceKeyPrefix}playlists_sorting_column`),
  )?.value as PlaylistsSortingColumn | undefined;

  return (
    <PageView sessionUser={session?.user} initialCollapsed={initialCollapsed}>
      <PlaylistFeedView
        playlists={playlists}
        sessionUser={session?.user}
        initialReversed={initialPlaylistsReversed}
        initialSortingColumn={initialPlaylistsSortingColumn}
      />
    </PageView>
  );
}
