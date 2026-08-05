import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { isPremiumUser } from "~/api/is-premium-user";
import { type PlaylistTrack } from "~/models/track.model";
import { playTracks } from "~/api/play-tracks";
import { revalidatePath } from "next/cache";
import { getTracks } from "~/api/get-tracks";
import { getNextPage } from "~/api/get-next-tracks";
import { ActionStatus } from "~/models/status.model";
import { GetDevicesStatus } from "~/models/device.model";
import { getDevices } from "~/api/get-devices";
import { redirect } from "next/navigation";
import { getQueue } from "~/api/get-queue";
import { PlaylistPageView } from "../playlist/[playlistId]/playlist-page-view";
import type { PlaylistObject } from "~/models/playlist.model";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Playpal | Liked Songs`,
    openGraph: {
      title: `Playpal | Liked Songs`,
      description: `Your Liked Songs`,
      type: "music.playlist",
      images: ["/liked-songs.jpg"],
      url: `${process.env.NEXTAUTH_URL}/liked-songs`,
    },
  };
}

export default async function LikedSongsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  const pagingTracks = await getTracks("me", session.user.access_token);
  const loadNextTracks = async (next: string) => {
    "use server";

    return await getNextPage(next, session.user.access_token);
  };

  const playlist = {
    id: "",
    name: "Liked Songs",
    description: "Your Liked Songs",
    image: "/liked-songs.jpg",
    userId: session?.user.id,
    createdAt: new Date(),
    externalUrl: "https://open.spotify.com/collection/tracks",
    owner: session.user,
    totalTracks: pagingTracks.total,
  } as PlaylistObject;

  if (!(await isPremiumUser(session.user.access_token)))
    return (
      <PlaylistPageView
        playlist={playlist}
        sessionUser={session.user}
        pagingTracks={pagingTracks}
        loadNextTracks={loadNextTracks}
        isLikedSongs={true}
      />
    );

  const queue = await getQueue(
    "me",
    pagingTracks.total,
    session.user.access_token,
  );

  return (
    <PlaylistPageView
      playlist={playlist}
      pagingTracks={pagingTracks}
      sessionUser={session.user}
      expires_at={session.user.expires_at}
      queue={queue}
      loadNextTracks={loadNextTracks}
      isLikedSongs={true}
      playTracks={async (
        expired: boolean,
        queue: PlaylistTrack[],
        deviceId: string,
      ) => {
        "use server";

        if (expired) {
          revalidatePath("/playlist", "page");
          return ActionStatus.Failure;
        }

        return await playTracks(queue, deviceId, session.user.access_token);
      }}
      loadDevices={async (expired: boolean) => {
        "use server";

        if (expired) {
          revalidatePath("/playlist", "page");
          return { status: GetDevicesStatus.UseWebPlayer };
        }

        return await getDevices(session.user.access_token);
      }}
    />
  );
}
