import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { Post } from "~/app/_components/post";

export async function generateMetadata({
  params: { profileId },
}: {
  params: { profileId: string };
}): Promise<Metadata> {
  const user = await getUser(profileId);

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
      url: `${process.env.NEXTAUTH_URL}/profile/${profileId}`,
    },
  };
}

export default async function ProfilePage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  console.log("ta sendo chamado");

  const session = await getServerSession(authOptions);

  const user = await getUser(profileId);

  if (!user)
    // no profile
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main-1 p-2 md:flex-row md:items-center md:rounded-b-2xl">
        <div className="font-bold">{user.posts.length} Posts</div>
      </div>

      {user.posts.map((post) => (
        <Post key={post.id} post={post} sessionUserId={session?.user.id} />
      ))}
    </div>
  );
}
