import type { Metadata } from "next";
import { getPlaylist } from "~/server/get-playlist";
import { ErrorPage } from "~/components/error-page";
import { UserFeedView } from "~/components/views/user-feed-view";
import type { UserObject } from "~/models/user.model";

export async function generateMetadata({
  params: { playlistId },
}: {
  params: { playlistId: string };
}): Promise<Metadata> {
  const playlist = await getPlaylist(playlistId);

  if (!playlist)
    return {
      title: "Playpal | Playlist | Likes",
      description: "Playlist not found",
      openGraph: {
        type: "music.playlist",
        images: ["/playpal.ico"],
        url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}/likes`,
      },
    };

  return {
    title: `Playpal | ${playlist.name} | Likes`,
    description: `Playlist - ${playlist.owner?.name} - ${playlist.totalTracks} tracks`,
    openGraph: {
      type: "music.playlist",
      images: [playlist.image],
      url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}/likes`,
    },
  };
}

export default async function PlaylistLikesPage({
  params: { playlistId },
}: {
  params: { playlistId: string };
}) {
  const playlist = await getPlaylist(playlistId);

  if (!playlist) return <ErrorPage />;

  return (
    <>
      <div className="flex flex-col gap-2 bg-container p-2">
        <div className="ml-2 font-bold">Liked By</div>
      </div>
      <UserFeedView
        users={(playlist.likes ?? [])
          .map((like) => like?.liker as UserObject)
          .filter((user) => !!user)}
      />
    </>
  );
}
