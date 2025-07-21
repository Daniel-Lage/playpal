import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { PlaylistPageView } from "./playlist-page-view";
import { isPremiumUser } from "~/api/is-premium-user";
import { getRandomSample } from "~/helpers/get-random-sample";
import { playTracksStatus, type PlaylistTrack } from "~/models/track.model";
import { playTracks } from "~/api/play-tracks";
import { revalidatePath } from "next/cache";
import { getPlaylist } from "~/server/get-playlist";
import { getTracks } from "~/api/get-tracks";
import type { IMetadata, Substring } from "~/models/post.model";
import { postPostStatus } from "~/models/post.model";
import { postPlaylistReply } from "~/server/post-playlist-reply";
import type { Device } from "~/models/device.model";

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
        description: `Playlist Not Found`,
        type: "music.playlist",
        images: ["/playpal.ico"],
        url: `${process.env.NEXTAUTH_URL}/playlist/${playlistId}`,
      },
    };

  return {
    title: `${playlist.name} | Playpal`,
    description: `Playlist - ${playlist.owner?.name} - ${playlist.totalTracks} tracks`,
    openGraph: {
      description: `Playlist - ${playlist.owner?.name} - ${playlist.totalTracks} tracks`,
      title: `${playlist.name} | Playpal`,
      type: "music.playlist",
      images: [playlist.image],
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

  const playlist = await getPlaylist(playlistId);

  if (!playlist) return <div>error</div>;

  const tracks = await getTracks(
    playlist.id,
    playlist.totalTracks,
    session?.user.access_token,
  );

  if (!session) return <PlaylistPageView playlist={playlist} tracks={tracks} />;

  const send = async (
    input: string,
    urls: Substring[] | undefined,
    metadata: IMetadata | undefined,
  ) => {
    "use server";

    if (!session?.user) return postPostStatus.ServerError; // shouldn't be able to be called if not logged in

    const result = await postPlaylistReply(
      input,
      session?.user.id,
      playlist.id,
      urls,
      metadata,
    );
    revalidatePath("/");
    return result;
  };

  if (!(await isPremiumUser(session.user.access_token)))
    return (
      <PlaylistPageView
        playlist={playlist}
        sessionUser={session.user}
        tracks={tracks}
        send={send}
      />
    );

  const queue = getRandomSample(
    tracks.filter((track) => !track.is_local),
    99,
  );

  return (
    <PlaylistPageView
      playlist={playlist}
      tracks={tracks}
      sessionUser={session.user}
      expires_at={session.user.expires_at}
      queue={queue}
      play={async (
        expired: boolean,
        queue: PlaylistTrack[],
        device?: Device,
      ) => {
        "use server";

        if (expired) {
          revalidatePath("/playlist", "page");
          return playTracksStatus.ServerError;
        }

        return await playTracks(queue, session.user.access_token, device);
      }}
      send={send}
    />
  );
}
