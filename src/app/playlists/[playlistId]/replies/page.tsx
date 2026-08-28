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
      title: "Playpal | Playlist | Replies",
      description: "Playlist not found",
      openGraph: {
        type: "music.playlist",
        images: ["/playpal.ico"],
        url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}/replies`,
      },
    };

  return {
    title: `Playpal | ${playlist.name} | Replies`,
    description: `Playlist - ${playlist.owner?.name} - ${playlist.totalTracks} tracks`,
    openGraph: {
      type: "music.playlist",
      images: [playlist.image],
      url: `${process.env.NEXTAUTH_URL}/playlists/${playlistId}/replies`,
    },
  };
}

export default async function PlaylistRepliesPage({
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
    <>
      <PlaylistDisplay playlist={playlist} />

      <div className="flex justify-between gap-2 bg-container p-2 md:px-4">
        <div className="font-bold">Replies</div>
        <LinkButton href={`/playlists/${playlist.id}`} className="font-bold">
          Back to Playlist
        </LinkButton>
      </div>
      <PlaylistRepliesView
        playlist={playlist}
        sessionUser={session?.user}
        send={send}
        initialReversed={initialReversed}
        initialSortingColumn={initialRepliesSortingColumn}
      />
    </>
  );
}
