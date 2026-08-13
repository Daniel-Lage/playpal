import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { authOptions } from "~/lib/auth";
import { getPlaylists } from "~/server/get-playlists";
import { getUsersFollowing } from "~/server/get-users-following";
import { getUsersLikes } from "~/server/get-users-likes";
import {
  parseBooleanCookie,
  parsePlaylistsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import PlaylistFeedView from "~/components/views/playlist-feed-view";
import { TabLinkButton } from "~/components/buttons/tab-link-button";

export const dynamic = "force-dynamic";

export default async function PlaylistsMainPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const following = session?.user.id
    ? [
        ...(await getUsersFollowing(session.user.id)),
        { followeeId: session.user.id },
      ]
    : undefined;
  const userIds = following?.map((value) => value.followeeId);

  const playlists = await getPlaylists({ userIds });

  if (userIds)
    for (const userId of userIds) {
      const { playlists: userPlaylistsLikes } = await getUsersLikes(userId);
      playlists.push(
        ...userPlaylistsLikes.filter(
          (playlist) => !playlists.some((value) => value.id === playlist.id),
        ),
      );
    }

  const cookiePrefix = getCookiePrefix(session?.user.id);

  const initialPlaylistsReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}playlists_reversed`)?.value,
  );

  const initialPlaylistsSortingColumn = parsePlaylistsSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}playlists_sorting_column`)?.value,
  );

  return (
    <>
      <div className="h-16 gap-2 border-b">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 bg-container px-2 font-bold">
          <TabLinkButton href="/">Posts</TabLinkButton>

          <TabLinkButton className="border" href="/playlists">
            Playlists
          </TabLinkButton>
        </div>
      </div>
      <PlaylistFeedView
        playlists={playlists}
        sessionUser={session?.user}
        initialReversed={initialPlaylistsReversed}
        initialSortingColumn={initialPlaylistsSortingColumn}
      />
    </>
  );
}
