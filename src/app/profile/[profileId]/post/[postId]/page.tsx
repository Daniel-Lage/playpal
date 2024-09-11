import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { getPost, getReplies, getThread, getUser } from "~/server/queries";
import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { Logo } from "~/app/_components/logo";
import { authOptions } from "~/lib/auth";
import { Post } from "~/app/_components/post";
import { formatPost } from "~/lib/format-post";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { profileId, postId },
}: {
  params: { profileId: string; postId: string };
}): Promise<Metadata> {
  const user = await getUser(profileId);

  if (!user)
    return {
      title: "Playpal | post",
      openGraph: {
        images: ["/favicon.ico"],
        title: "Playpal | Post",
        creators: [`${process.env.NEXTAUTH_URL}/profile/${profileId}`],
        url: `${process.env.NEXTAUTH_URL}/profile/${profileId}/post/${postId}`,
      },
    };

  return {
    title: `Playpal | post by ${user.name}`,
    openGraph: {
      images: [user?.image ?? "/favicon.ico"],
      title: `Playpal | Post by ${user.name}`,
      creators: [`${process.env.NEXTAUTH_URL}/profile/${profileId}`],
      url: `${process.env.NEXTAUTH_URL}/profile/${profileId}/post/${postId}`,
    },
  };
}

export default async function PostPage({
  params: { postId },
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await getPost(postId);

  if (!post)
    return <div className="self-center text-xl text-red-500">Error</div>;

  const formattedPost = await formatPost(post);
  const thread = await Promise.all(
    (await getThread(post.thread)).map(formatPost),
  );
  const replies = await Promise.all(
    (await getReplies(post.id)).map(formatPost),
  );

  return (
    <>
      {post.thread.map((postId, index) => {
        const post = thread.find((post) => post.id === postId);

        if (!post)
          return (
            <div
              key={index}
              className="flex flex-col gap-2 bg-secondary2 p-6 md:rounded-xl"
            >
              Post Was Deleted
            </div>
          );

        return <Post key={post.id} post={post} userId={session?.user.id} />;
      })}
      <div>
        <Post post={formattedPost} userId={session?.user.id} focused={true} />
        {session?.user?.image && session?.user?.name ? (
          <div className="flex flex-col gap-2 bg-main p-2 md:rounded-b-xl">
            <div className="flex items-center justify-between">
              <Link
                className="flex items-center"
                href={`/profile/${session.user.id}`}
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
              <PostCreator
                userId={session?.user.id}
                thread={[...post.thread, post.id]}
              />
            </div>
          </div>
        ) : (
          <SignInButton />
        )}
      </div>

      {replies.map((reply) => (
        <Post key={reply.id} post={reply} userId={session?.user.id} />
      ))}
    </>
  );
}
