import { getServerSession } from "next-auth";

import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import {
  postPostStatus,
  PostType,
  type IMetadata,
  type Substring,
} from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { getPlaylists } from "~/server/get-playlists";
import { FeedView } from "./user/[userId]/feed-view";
import { getUsersFollowing } from "~/server/get-users-following";
import { getUsersLikes } from "~/server/get-users-likes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
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
        ...userPostLikes.filter((post) => post.type === PostType.Post),
      );
      playlists.push(...userPlaylistsLikes);
    }

  return (
    <FeedView
      posts={posts}
      sessionUser={session?.user}
      send={async (
        input: string,
        urls: Substring[] | undefined,
        metadata: IMetadata | undefined,
      ) => {
        "use server";

        if (!session?.user) return postPostStatus.ServerError; // shouldn't be able to be called if not logged in

        const status = await postPost(input, session?.user.id, urls, metadata);

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
