import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { getPost, getUser } from "~/server/queries";
import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { Logo } from "~/app/_components/logo";
import { authOptions } from "~/lib/auth";
import { Post } from "~/app/_components/post";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { profileId, postId },
}: {
  params: { profileId: string; postId: string };
}): Promise<Metadata> {
  const user = await getUser(profileId);
  const post = await getPost(postId);

  if (!user || !post)
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
      description: post.content,
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

  return (
    <>
      <div className="flex flex-col rounded-xl bg-secondary">
        {post?.thread?.[0]?.repliee ? (
          <>
            <Post post={post?.thread?.[0]?.repliee} userId={session?.user.id} />

            <div className="flex justify-stretch">
              <div className="m-1 w-1 rounded-xl bg-black"></div>
              <div className="flex w-full flex-col items-stretch">
                {post.thread?.map(
                  ({ repliee }, index) =>
                    repliee &&
                    index !== 0 && (
                      <Post
                        key={repliee.id}
                        post={repliee}
                        userId={session?.user.id}
                      />
                    ),
                )}
                <Post post={post} userId={session?.user.id} focused={true} />
              </div>
            </div>
          </>
        ) : (
          <Post post={post} userId={session?.user.id} focused={true} />
        )}

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
                parent={{ id: post.id, thread: post.thread }}
              />
            </div>
          </div>
        ) : (
          <SignInButton />
        )}
      </div>

      {post.replies?.map((replythread) => (
        <div
          key={replythread[0]?.replierId}
          className="flex justify-stretch rounded-xl bg-secondary"
        >
          <div className="m-1 my-2 w-1 rounded-xl bg-black"></div>
          <div className="flex w-full flex-col items-stretch">
            {replythread.map(
              ({ replier }) =>
                replier && (
                  <Post
                    key={replier.id}
                    post={replier}
                    userId={session?.user.id}
                  />
                ),
            )}
          </div>
        </div>
      ))}
    </>
  );
}
