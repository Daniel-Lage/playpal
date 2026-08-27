import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import type { Metadata } from "next";
import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import { PostType, type IMetadata } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { getUsersFollowing } from "~/server/get-users-following";
import { getUsersLikes } from "~/server/get-users-likes";
import { ActionStatus } from "~/models/status.model";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { PostFeedView } from "~/components/views/post-feed-view";
import { TabLinkButton } from "~/components/buttons/tab-link-button";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Playpal | Home",
    description: "Playpal Home Page",
    openGraph: {
      type: "website",
      images: ["/favicon.ico"],
      url: `${process.env.NEXTAUTH_URL}/home`,
    },
  };
}
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

  if (userIds)
    for (const userId of userIds) {
      const { posts: userPostLikes } = await getUsersLikes(userId);
      posts.push(
        ...userPostLikes.filter(
          (post) =>
            post.type === PostType.Post &&
            !posts.some((value) => value.id === post.id),
        ),
      );
    }

  const cookiePrefix = getCookiePrefix(session?.user.id);

  const initialPostsReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}posts_reversed`)?.value,
  );

  const initialPostsSortingColumn = parsePostsSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}posts_sorting_column`)?.value,
  );

  return (
    <>
      <div className="h-16 gap-2 border-b">
        <div className="grid h-full w-full grid-cols-2 place-items-center gap-1 bg-container px-2 font-bold">
          <TabLinkButton className="border" href="/home">
            Posts
          </TabLinkButton>

          <TabLinkButton href="/playlists">Playlists</TabLinkButton>
        </div>
      </div>
      <PostFeedView
        posts={posts}
        sessionUser={session?.user}
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
        initialReversed={initialPostsReversed}
        initialSortingColumn={initialPostsSortingColumn}
      />
    </>
  );
}
