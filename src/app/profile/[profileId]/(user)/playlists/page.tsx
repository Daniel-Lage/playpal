import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { getMyPlaylists } from "~/api/get-my-playlists";
import { getUsersPlaylists } from "~/api/get-users-playlists";
import ProfilePlaylistFeed from "./profile-playlist-feed";

export async function generateMetadata({
  params: { profileId },
}: {
  params: { profileId: string };
}): Promise<Metadata> {
  const user = await getUser(profileId);

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
      url: `${process.env.NEXTAUTH_URL}/profile/${profileId}`,
    },
  };
}

export default async function ProfilePage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const session = await getServerSession(authOptions);

  const playlists =
    session?.user.providerAccountId === profileId
      ? await getMyPlaylists(session.user.access_token)
      : await getUsersPlaylists(session?.user.access_token, profileId);

  return (
    <ProfilePlaylistFeed
      playlists={playlists}
      sessionUserId={session?.user.id}
    />
  );
}
