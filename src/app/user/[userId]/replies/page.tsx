import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { PostsView } from "~/app/posts-view";
import { getPosts } from "~/server/get-posts";

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

  const posts = await getPosts({ userIds: [userId], replies: true });

  return (
    <>
      <PostsView
        posts={posts}
        sessionUser={session?.user}
        lastQueried={new Date()}
        refresh={async (lastQueried: Date) => {
          "use server";
          return await getPosts({
            userIds: [userId],
            replies: true,
            lastQueried,
          });
        }}
      />
    </>
  );
}
