import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";

import { PostType } from "~/models/post.model";
import Link from "next/link";
import Image from "next/image";
import { PostCreator } from "~/app/_components/post-creator";
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
  const session = await getServerSession(authOptions);

  const user = await getUser(profileId);

  if (!user)
    // no profile
    return <div className="self-center text-xl text-red-500">Error</div>;

  const posts = user.posts.filter((post) => post.type === PostType.Post);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-2xl">
        <div className="font-bold">{posts.length} Posts</div>
      </div>

      {session?.user.id === user.id && (
        <div className="flex flex-col gap-2 bg-main p-2 md:rounded-xl">
          <div className="flex items-center justify-between">
            <Link className="flex items-center" href={"/profile"}>
              <Image
                width={40}
                height={40}
                className="rounded-full"
                src={user.image ?? ""}
                alt={user.name ?? ""}
              />
              <div className="px-2 font-bold">{user.name}</div>
            </Link>
          </div>
          <div className="flex">
            <PostCreator sessionUserId={session.user.id} />
          </div>
        </div>
      )}

      {posts.map((post) => (
        <Post key={post.id} post={post} sessionUserId={session?.user.id} />
      ))}
    </div>
  );
}
