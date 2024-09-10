import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";

import PlaylistView from "./playlist-view";

import type { Metadata } from "next";
import { getPlaylist } from "~/api/calls";

export async function generateMetadata({
  params: { playlistId, profileId },
}: {
  params: { playlistId: string; profileId: string };
}): Promise<Metadata> {
  const playlist = await getPlaylist(
    process.env.FALLBACK_USERID ?? null,
    playlistId,
  );

  if (!playlist)
    return {
      title: `Playpal | Playlist`,
      openGraph: {
        title: `Playpal | Playlist`,
        type: "music.playlist",
        images: ["/playpal.ico"],
        creators: [`${process.env.NEXTAUTH_URL}/profile/${profileId}`],
        url: `${process.env.NEXTAUTH_URL}/profile/${profileId}/playlist/${playlistId}`,
      },
    };

  return {
    title: `Playpal | ${playlist.name}`,
    description: playlist.description ?? "",
    openGraph: {
      description: playlist.description ?? "",
      title: `Playpal | ${playlist.name}`,
      type: "music.playlist",
      images: [playlist?.images[0]?.url ?? "/playpal.ico"],
      creators: [`${process.env.NEXTAUTH_URL}/profile/${profileId}`],
      url: `${process.env.NEXTAUTH_URL}/profile/${profileId}/playlist/${playlistId}`,
    },
  };
}

export default async function PlaylistPage({
  params: { playlistId },
}: {
  params: { playlistId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) return <PlaylistView userId={null} playlistId={playlistId} />;

  return <PlaylistView userId={session.user.id} playlistId={playlistId} />;
}
