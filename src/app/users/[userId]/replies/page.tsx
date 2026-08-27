import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { PostFeedView } from "~/components/views/post-feed-view";
import { getPosts } from "~/server/get-posts";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";

export async function generateMetadata({
  params: { userId },
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);

  if (!user)
    return {
      title: "PlayPal | User | Replies",
      openGraph: {
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/users/${userId}/replies`,
      },
    };

  return {
    title: `Playpal | ${user.name} | Replies`,
    openGraph: {
      images: [user.image ?? "/favicon.ico"],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/users/${userId}/replies`,
    },
  };
}

export default async function UsersRepliesPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookiePrefix = getCookiePrefix(session?.user.id);
  const cookieStore = cookies();

  const posts = await getPosts({ userIds: [userId], replies: true });

  const initialReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}posts_reversed`)?.value,
  );
  const initialSortingColumn = parsePostsSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}posts_sorting_column`)?.value,
  );

  return (
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
  );
}
