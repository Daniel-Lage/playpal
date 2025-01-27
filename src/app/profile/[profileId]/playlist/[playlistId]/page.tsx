import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { getPlaylist } from "~/api/get-playlist";
import { PlaylistView } from "./playlist-view";
import { getMySpotifyUser } from "~/api/get-my-spotify-user";
import { getRandomSample } from "~/app/helpers/get-random-sample";
import type { PlaylistTrack } from "~/models/track.model";
import { playTracks } from "~/api/play-tracks";
import { setFirstItem } from "~/app/helpers/set-first-item";

export async function generateMetadata({
  params: { playlistId, profileId },
}: {
  params: { playlistId: string; profileId: string };
}): Promise<Metadata> {
  const playlist = await getPlaylist(
    null, // will use fallback
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
  params: { playlistId },
}: {
  params: { playlistId: string };
}) {
  const session = await getServerSession(authOptions);

  const playlist = await getPlaylist(session?.user.access_token, playlistId);

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
      play={async (start?: PlaylistTrack) => {
        "use server";

        if (start) {
          await playTracks(
            session.user.access_token,
            setFirstItem(
              queue,
              start,
              (other) => other.track.uri === start.track.uri,
            ),
          );
        } else {
          await playTracks(session.user.access_token, queue);
        }
      }}
    />
  );
}
