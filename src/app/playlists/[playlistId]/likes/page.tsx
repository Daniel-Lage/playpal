import type { Metadata } from "next";
import { getPlaylist } from "~/server/get-playlist";
import { ErrorPage } from "~/components/error-page";
import { UserFeedView } from "~/components/views/user-feed-view";
import type { UserObject } from "~/models/user.model";
import { PlaylistDisplay } from "~/components/playlist-display";
import { LinkButton } from "~/components/buttons/link-button";

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
      <PlaylistDisplay playlist={playlist} />

      <div className="flex justify-between gap-2 bg-container p-2 md:px-4">
        <div className="font-bold">Likes</div>
        <LinkButton href={`/playlists/${playlist.id}`} className="font-bold">
          Back to Playlist
        </LinkButton>
      </div>

      <UserFeedView
        users={(playlist.likes ?? [])
          .map((like) => like?.liker as UserObject)
          .filter((user) => !!user)}
      />
    </>
  );
}
