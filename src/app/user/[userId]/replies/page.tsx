import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { PostFeedView } from "~/components/post-feed-view";
import { getPosts } from "~/server/get-posts";
import { PageView } from "~/components/page-view";
import { PostsSortingColumn } from "~/models/post.model";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export async function generateMetadata({
  params: { userId },
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);

  if (!user)
    return {
      title: "PlayPal | Posts and replies",
      openGraph: {
        title: "PlayPal | Posts and replies",
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  return {
    title: `Playpal | ${user.name} posts and replies`,
    openGraph: {
      title: `Playpal | ${user.name} posts and replies`,
      images: [user.image ?? "/favicon.ico"],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/user/${userId}`,
    },
  };
}

export default async function RepliesPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  const posts = await getPosts({ userIds: [userId], replies: true });
  const preferenceKeyPrefix = session?.user.id ? `${session.user.id}:` : "";
  const initialCollapsed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}side_bar_collapsed`),
    )?.value === "true";
  const initialReversed =
    cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}posts_reversed`),
    )?.value === "true";
  const initialSortingColumn =
    (cookieStore.get(
      storageKeyToCookieName(`${preferenceKeyPrefix}posts_sorting_column`),
    )?.value as PostsSortingColumn | undefined) ?? PostsSortingColumn.CreatedAt;

  return (
    <PageView sessionUser={session?.user} initialCollapsed={initialCollapsed}>
      <PostFeedView
        posts={posts}
        sessionUser={session?.user}
        lastQueried={new Date()}
        initialReversed={initialReversed}
        initialSortingColumn={initialSortingColumn}
        refresh={async (lastQueried: Date) => {
          "use server";
          return await getPosts({
            userIds: [userId],
            replies: true,
            lastQueried,
          });
        }}
      />
    </PageView>
  );
}
