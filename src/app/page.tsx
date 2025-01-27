import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import { Post } from "./_components/post";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();

  return (
    <>
      {session?.user?.image && session?.user?.name ? (
        <div className="flex flex-col gap-2 bg-main p-2 md:rounded-xl">
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center hover:underline"
              href={`/profile/${session.user.providerAccountId}`}
            >
              <Image
                width={40}
                height={40}
                className="rounded-full"
                src={session.user.image}
                alt={session.user.name}
              />
              <div className="px-2 font-bold">{session.user.name}</div>
            </Link>
          </div>
          <div className="flex">
            <PostCreator sessionUserId={session.user.id} />
          </div>
        </div>
      ) : (
        <SignInButton />
      )}
      {posts.map((post) => (
        <Post key={post.id} post={post} sessionUserId={session?.user.id} />
      ))}
    </>
  );
}
