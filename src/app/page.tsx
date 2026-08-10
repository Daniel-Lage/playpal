import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import { PostType, type IMetadata } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { getPlaylists } from "~/server/get-playlists";
import { FeedView } from "~/components/feed-view";
import { getUsersFollowing } from "~/server/get-users-following";
import { getUsersLikes } from "~/server/get-users-likes";
import { ActionStatus } from "~/models/status.model";
import {
  PostsSortingColumn,
  type PostsSortingColumn as PostsSortingColumnType,
} from "~/models/post.model";
import { PlaylistsSortingColumn } from "~/models/playlist.model";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const following = session?.user.id
    ? [
        ...(await getUsersFollowing(session.user.id)),
        { followeeId: session.user.id },
      ]
    : undefined;
  const userIds = following?.map((value) => value.followeeId);

  const posts = await getPosts({ userIds });
  const playlists = await getPlaylists({ userIds });

  if (userIds)
    for (const userId of userIds) {
      const { posts: userPostLikes, playlists: userPlaylistsLikes } =
        await getUsersLikes(userId);
      posts.push(
        ...userPostLikes.filter(
          (post) =>
            post.type === PostType.Post &&
            !posts.some((value) => value.id === post.id),
        ),
      );
      playlists.push(
        ...userPlaylistsLikes.filter(
          (playlist) => !playlists.some((value) => value.id === playlist.id),
        ),
      );
    }

  const preferenceKeyPrefix = session?.user.id ? `${session.user.id}:` : "";
  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}side_bar_collapsed`),
    )?.value === "true";
  const initialPostsReversed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}posts_reversed`),
    )?.value === "true";
  const initialPostsSortingColumn =
    (cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}posts_sorting_column`),
    )?.value as PostsSortingColumnType | undefined) ??
    PostsSortingColumn.CreatedAt;
  const initialPlaylistsReversed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}playlists_reversed`),
    )?.value === "true";
  const initialPlaylistsSortingColumn =
    (cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}playlists_sorting_column`),
    )?.value as PlaylistsSortingColumn | undefined) ??
    PlaylistsSortingColumn.CreatedAt;

  return (
    <FeedView
      posts={posts}
      sessionUser={session?.user}
      initialCollapsed={initialCollapsed}
      initialPostsReversed={initialPostsReversed}
      initialPostsSortingColumn={initialPostsSortingColumn}
      initialPlaylistsReversed={initialPlaylistsReversed}
      initialPlaylistsSortingColumn={initialPlaylistsSortingColumn}
      send={async (
        input: string,
        mentions: string[] | undefined,
        metadata: IMetadata | undefined,
      ) => {
        "use server";

        if (!session?.user) return ActionStatus.Failure;

        const status = await postPost(
          input,
          session?.user.id,
          mentions,
          metadata,
        );

        revalidatePath("/");

        return status;
      }}
      lastQueried={new Date()}
      refresh={async (lastQueried: Date) => {
        "use server";
        return await getPosts({ userIds, lastQueried });
      }}
      playlists={playlists}
    />
  );
}
