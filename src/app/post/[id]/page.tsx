import { getServerSession } from "next-auth";
import { getPost, getPosts, getReplies, getThread } from "~/server/queries";
import { PostCreator } from "~/app/_components/post-creator";
import { authOptions } from "~/lib/auth";
import { Post } from "~/app/_components/post";
import Image from "next/image";
import { Logo } from "~/app/_components/logo";
import { SignInButton } from "~/app/_components/signin-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await getPost(id);
  const thread = await getThread(post.thread);
  const replies = await getReplies(id);

  return (
    <>
      {thread.map((reply) => (
        <Post key={reply.id} post={reply} session={session} />
      ))}
      <Post post={post} session={session} />
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
            <PostCreator session={session} thread={[...post.thread, post.id]} />
          </div>
        </div>
      ) : (
        <SignInButton />
      )}
      {replies.map((reply) => (
        <Post key={reply.id} post={reply} session={session} />
      ))}
    </>
  );
}
