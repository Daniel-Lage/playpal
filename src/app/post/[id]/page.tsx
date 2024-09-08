import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { getPost, getReplies, getThread } from "~/server/queries";
import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { Post } from "~/app/_components/post";
import { Logo } from "~/app/_components/logo";
import { authOptions } from "~/lib/auth";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await getPost(id);

  if (!post)
    return <div className="self-center text-xl text-red-500">Error</div>;

  const thread = await getThread(post.thread);
  const replies = await getReplies(post.id);

  return (
    <>
      {post.thread.map((postId, index) => {
        const post = thread.find((post) => post.id === postId);

        if (!post)
          return (
            <div
              key={index}
              className="bg-secondary2 flex flex-col gap-2 p-6 md:rounded-xl"
            >
              Post Was Deleted
            </div>
          );

        return <Post key={post.id} post={post} session={session} />;
      })}
      <div>
        <Post post={post} session={session} focused={true} />
        {session?.user?.image && session?.user?.name ? (
          <div className="flex flex-col gap-2 bg-main1 p-2 md:rounded-b-xl">
            <div className="flex items-center justify-between">
              <Link
                className="flex items-center"
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
              <Logo />
            </div>
            <div className="flex">
              <PostCreator
                session={session}
                thread={[...post.thread, post.id]}
              />
            </div>
          </div>
        ) : (
          <SignInButton />
        )}
      </div>

      {replies.map((reply) => (
        <Post key={reply.id} post={reply} session={session} />
      ))}
    </>
  );
}
