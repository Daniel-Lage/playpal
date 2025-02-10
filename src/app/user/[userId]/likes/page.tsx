import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { PostView } from "~/app/_components/post-view";
import { getUsersLikes } from "~/server/get-users-likes";

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

  const likes = await getUsersLikes(userId);

  return (
    <>
      {likes.map(
        (like) =>
          like?.likee && (
            <PostView
              key={like.likee.id}
              post={like.likee}
              sessionUserId={session?.user.id}
            />
          ),
      )}
    </>
  );
}
