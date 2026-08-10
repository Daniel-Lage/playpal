import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { PlaylistPageView } from "./playlist-page-view";
import { isPremiumUser } from "~/api/is-premium-user";
import { type PlaylistTrack } from "~/models/track.model";
import { playTracks } from "~/api/play-tracks";
import { revalidatePath } from "next/cache";
import { getPlaylist } from "~/server/get-playlist";
import { getTracks } from "~/api/get-tracks";
import { getNextPage } from "~/api/get-next-tracks";
import type { IMetadata } from "~/models/post.model";
import { postPlaylistReply } from "~/server/post-playlist-reply";
import { ActionStatus } from "~/models/status.model";
import { ErrorPage } from "~/app/error-page";
import { GetDevicesStatus } from "~/models/device.model";
import { getDevices } from "~/api/get-devices";
import { getQueue } from "~/api/get-queue";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

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

  const preferenceKeyPrefix = session?.user.id ? `${session.user.id}:` : "";
  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}side_bar_collapsed`),
    )?.value === "true";
  const initialShuffled =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}play_shuffled`),
    )?.value !== "false";

  if (!session)
    return (
      <PlaylistPageView
        playlist={playlist}
        pagingTracks={pagingTracks}
        loadNextTracks={loadNextTracks}
        initialCollapsed={initialCollapsed}
        initialShuffled={initialShuffled}
      />
    );

  const send = async (
    input: string,
    mentions: string[] | undefined,
    metadata: IMetadata | undefined,
  ) => {
    "use server";

    if (!session?.user) return ActionStatus.Failure;

    const result = await postPlaylistReply(
      input,
      session?.user.id,
      playlist.id,
      mentions,
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
        pagingTracks={pagingTracks}
        loadNextTracks={loadNextTracks}
        sendReply={send}
        initialCollapsed={initialCollapsed}
        initialShuffled={initialShuffled}
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
      sendReply={send}
      initialCollapsed={initialCollapsed}
      initialShuffled={initialShuffled}
    />
  );
}
