import { getServerSession } from "next-auth";
import { getPosts } from "~/server/queries";
import { PostCreator } from "./_components/post-creator";
import { authOptions } from "~/lib/auth";
import { Post } from "./_components/post";
import Image from "next/image";
import { Logo } from "./_components/logo";
import { SignInButton } from "./_components/signin-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();

  return (
    <>
      {session?.user?.image && session?.user?.name ? (
        <div className="flex flex-col gap-2 bg-main1 p-2 md:rounded-xl">
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center"
              href={`profile/${session.user.providerAccountId}`}
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
            <Logo />
          </div>
          <div className="flex">
            <PostCreator session={session} />
          </div>
        </div>
      ) : (
        <SignInButton />
      )}
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
}
