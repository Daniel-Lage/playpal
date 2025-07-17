import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { getPlaylist } from "~/api/get-playlist";
import { PlaylistView } from "./playlist-view";
import { getMySpotifyUser } from "~/api/get-my-spotify-user";
import { getRandomSample } from "~/helpers/get-random-sample";
import { playTracksStatus, type PlaylistTrack } from "~/models/track.model";
import { playTracks } from "~/api/play-tracks";
import { setFirstItem } from "~/helpers/set-first-item";
import { revalidatePath } from "next/cache";

export async function generateMetadata({
  params: { playlistId },
}: {
  params: { playlistId: string };
}): Promise<Metadata> {
  const playlist = await getPlaylist(playlistId);

  if (!playlist)
    return {
      title: `Playpal | playlist`,
      openGraph: {
        title: `Playpal | playlist`,
        type: "music.playlist",
        images: ["/playpal.ico"],
        url: `${process.env.NEXTAUTH_URL}/playlist/${playlistId}`,
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
      url: `${process.env.NEXTAUTH_URL}/playlist/${playlistId}`,
    },
  };
}

export default async function PlaylistPage({
  params: { playlistId },
}: {
  params: { playlistId: string };
}) {
  const session = await getServerSession(authOptions);

  const playlist = await getPlaylist(playlistId, session?.user.access_token);

  if (!playlist) return <div>error</div>; // playlist not found

  if (!session) return <PlaylistView playlist={playlist} />; // not logged in

  const spotifyUser = await getMySpotifyUser(session.user.access_token);

  if (spotifyUser.product !== "premium")
    return <PlaylistView playlist={playlist} sessionUserId={session.user.id} />; // user cant play

  const queue = getRandomSample(
    playlist.tracks.items.filter((track) => !track.is_local),
    99,
  );

  return (
    <PlaylistView
      playlist={playlist}
      sessionUserId={session.user.id}
      expires_at={session.user.expires_at}
      play={async (expired: boolean, start?: PlaylistTrack) => {
        "use server";

        if (expired) {
          revalidatePath("/playlist", "page");
          return playTracksStatus.ServerError;
        }

        return await playTracks(
          start
            ? setFirstItem(
                queue,
                start,
                (other) => other.track.uri === start.track.uri,
              )
            : queue,
          session.user.access_token,
        );
      }}
    />
  );
}
