import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { isPremiumUser } from "~/api/is-premium-user";
import { type PlaylistTrack } from "~/models/track.model";
import { playTracks } from "~/api/play-tracks";
import { revalidatePath } from "next/cache";
import { getPlaylist } from "~/server/get-playlist";
import { getTracks } from "~/api/get-tracks";
import { getNextPage } from "~/api/get-next-tracks";
import { ActionStatus } from "~/models/status.model";
import { ErrorPage } from "~/components/error-page";
import { GetDevicesStatus } from "~/models/device.model";
import { getDevices } from "~/api/get-devices";
import { getQueue } from "~/api/get-queue";
import {
  parseBooleanCookie,
  parseTracksSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { PlaylistPageView } from "~/components/views/playlist-page-view";

export async function generateMetadata({
  params: { playlistId },
}: {
  params: { playlistId: string };
}): Promise<Metadata> {
  const playlist = await getPlaylist(playlistId);

  if (!playlist)
    return {
      title: "Playpal | Playlist",
      description: "Playlist not found",
      openGraph: {
        type: "music.playlist",
        images: ["/playpal.ico"],
        url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}`,
      },
    };

  return {
    title: `Playpal | ${playlist.name}`,
    description: `Playlist - ${playlist.owner?.name} - ${playlist.totalTracks} tracks`,
    openGraph: {
      type: "music.playlist",
      images: [playlist.image],
      url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}`,
    },
  };
}

export default async function PlaylistPage({
  params: { playlistId },
}: {
  params: { playlistId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookiePrefix = getCookiePrefix(session?.user.id);
  const cookieStore = cookies();

  const playlist = await getPlaylist(playlistId);

  if (!playlist) return <ErrorPage />;

  const pagingTracks = await getTracks(
    `playlists/${playlist.id}`,
    session?.user.access_token,
  );

  const loadNextTracks = async (next: string) => {
    "use server";

    return await getNextPage(next, session?.user.access_token);
  };

  const initialShuffled = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}play_shuffled`)?.value,
  );

  const initialTracksReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}tracks_reversed`)?.value,
  );

  const initialTracksSortingColumn = parseTracksSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}tracks_sorting_column`)?.value,
  );

  if (!session)
    return (
      <PlaylistPageView
        playlist={playlist}
        pagingTracks={pagingTracks}
        loadNextTracks={loadNextTracks}
        initialShuffled={initialShuffled}
        initialTracksReversed={initialTracksReversed}
        initialTracksSortingColumn={initialTracksSortingColumn}
      />
    );

  if (!(await isPremiumUser(session.user.access_token)))
    return (
      <PlaylistPageView
        playlist={playlist}
        sessionUser={session.user}
        pagingTracks={pagingTracks}
        loadNextTracks={loadNextTracks}
        initialShuffled={initialShuffled}
        initialTracksReversed={initialTracksReversed}
        initialTracksSortingColumn={initialTracksSortingColumn}
      />
    );

  const queue = await getQueue(
    `playlists/${playlist.id}`,
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
      initialShuffled={initialShuffled}
      initialTracksReversed={initialTracksReversed}
      initialTracksSortingColumn={initialTracksSortingColumn}
    />
  );
}
