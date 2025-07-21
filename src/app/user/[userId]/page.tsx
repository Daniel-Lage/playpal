import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { authOptions } from "~/lib/auth";

import {
  postPostStatus,
  type IMetadata,
  type Substring,
} from "~/models/post.model";
import { getUser } from "~/server/get-user";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { getPlaylists } from "~/server/get-playlists";
import { FeedView } from "./feed-view";
import { getPosts } from "~/server/get-posts";

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
  const posts = await getPosts({ userIds: [userId] });
  const playlists = await getPlaylists({ userIds: [userId] });

  return (
    <FeedView
      posts={posts}
      sessionUser={session?.user}
      send={
        session?.user.id === userId
          ? async (
              input: string,
              urls: Substring[] | undefined,
              metadata: IMetadata | undefined,
            ) => {
              "use server";

              if (!session?.user) return postPostStatus.ServerError; // shouldn't be able to be called if not logged in

              const status = await postPost(
                input,
                session.user.id,
                urls,
                metadata,
              );

              revalidatePath("/");
              return status;
            }
          : undefined
      }
      lastQueried={new Date()}
      refresh={async (lastQueried: Date) => {
        "use server";
        return await getPosts({ userIds: [userId], lastQueried });
      }}
      playlists={playlists}
    />
  );
}
