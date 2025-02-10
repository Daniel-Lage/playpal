import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "~/lib/auth";

import { type IMetadata, type Substring } from "~/models/post.model";
import { PostCreator } from "~/app/_components/post-creator";
import { getUser } from "~/server/get-user";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { getUsersPosts } from "~/server/get-users-posts";
import { PostsView } from "~/app/posts-view";

export async function generateMetadata({
  params: { userId },
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);

  if (!user)
    return {
      title: "PlayPal | Profile",
      openGraph: {
        title: "PlayPal | Profile",
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  if (!user.image)
    return {
      title: `Playpal | ${user.name}`,
      openGraph: {
        title: `Playpal | ${user.name}`,
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  return {
    title: `Playpal | ${user.name}`,
    openGraph: {
      title: `Playpal | ${user.name}`,
      images: [user.image],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/user/${userId}`,
    },
  };
}

export default async function ProfilePage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  const posts = await getUsersPosts(userId);

  return (
    <>
      {session?.user.id === userId && (
        <PostCreator
          send={async (
            input: string,
            urls: Substring[] | undefined,
            metadata: IMetadata | undefined,
          ) => {
            "use server";
            await postPost(input, session.user.id, urls, metadata);

            revalidatePath("/");
          }}
          sessionUser={session.user}
        />
      )}

      <PostsView
        posts={posts}
        sessionUserId={session?.user.id}
        lastQueried={new Date()}
        refresh={async (lastQueried: Date) => {
          "use server";
          return await getUsersPosts(userId, false, lastQueried);
        }}
      />
    </>
  );
}
