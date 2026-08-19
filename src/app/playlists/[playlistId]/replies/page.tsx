import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "~/lib/auth";

import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { getPlaylist } from "~/server/get-playlist";
import { ActionStatus } from "~/models/status.model";
import { ErrorPage } from "~/components/error-page";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { PlaylistRepliesView } from "~/components/views/playlist-replies-view";
import { postPlaylistReply } from "~/server/post-playlist-reply";
import type { IMetadata } from "~/models/post.model";

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
        url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}`,
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
      url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}`,
    },
  };
}

export default async function PlaylistRepliesMainPage({
  params: { playlistId },
}: {
  params: { playlistId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookiePrefix = getCookiePrefix(session?.user.id);
  const cookieStore = cookies();

  const playlist = await getPlaylist(playlistId);

  if (!playlist) return <ErrorPage />;

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

  const initialReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}playlist_replies_reversed`)?.value,
  );

  const initialRepliesSortingColumn = parsePostsSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}playlist_replies_sorting_column`)?.value,
  );

  return (
    <PlaylistRepliesView
      playlist={playlist}
      sessionUser={session?.user}
      send={send}
      initialReversed={initialReversed}
      initialSortingColumn={initialRepliesSortingColumn}
    />
  );
}
