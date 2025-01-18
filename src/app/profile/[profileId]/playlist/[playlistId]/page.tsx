import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { getPlaylist } from "~/api/get-playlist";
import PlaylistView from "./playlist-view";

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
      title: `Playpal | playlist`,
      openGraph: {
        title: `Playpal | playlist`,
        type: "music.playlist",
        images: ["/playpal.ico"],
        creators: [`${process.env.NEXTAUTH_URL}/profile/${profileId}`],
        url: `${process.env.NEXTAUTH_URL}/profile/${profileId}/playlist/${playlistId}`,
      },
    };

  return {
    title: `${playlist.name} | Playpal`,
    description: `Playlist - ${playlist.owner.display_name} - ${playlist.tracks.total} tracks`,
    openGraph: {
      description: `Playlist - ${playlist.owner.display_name} - ${playlist.tracks.total} tracks`,
      title: `${playlist.name} | Playpal`,
      type: "music.playlist",
      images: [playlist?.images[0]?.url ?? "/playpal.ico"],
      creators: [`${process.env.NEXTAUTH_URL}/profile/${profileId}`],
      url: `${process.env.NEXTAUTH_URL}/profile/${profileId}/playlist/${playlistId}`,
    },
  };
}

export default async function PlaylistPage({
  params: { playlistId, profileId },
}: {
  params: { playlistId: string; profileId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session)
    return (
      <PlaylistView
        sessionUserId={null}
        playlistId={playlistId}
        profileId={profileId}
      />
    );

  return (
    <PlaylistView
      sessionUserId={session.user.id}
      playlistId={playlistId}
      profileId={profileId}
    />
  );
}
