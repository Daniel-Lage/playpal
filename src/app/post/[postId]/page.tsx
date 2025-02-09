import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getPost } from "~/server/get-post";
import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";
import { PostView } from "~/app/_components/post-view";
import type { IMetadata, Substring } from "~/models/post.model";
import { PostCreator } from "~/app/_components/post-creator";
import { postPost } from "~/server/post-post";
import { SignInButton } from "~/app/_components/signin-button";
import { revalidatePath } from "next/cache";
import { Thread } from "./thread";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { userId, postId },
}: {
  params: { userId: string; postId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);
  const post = await getPost(postId);

  if (!user || !post)
    return {
      title: "Playpal | post",
      openGraph: {
        images: ["/favicon.ico"],
        title: "Playpal | Post",
        creators: [`${process.env.NEXTAUTH_URL}/user/${userId}`],
        url: `${process.env.NEXTAUTH_URL}/post/${postId}`,
      },
    };

  return {
    title: `Playpal | post by ${user.name}`,
    openGraph: {
      images: [user?.image ?? "/favicon.ico"],
      title: `Playpal | Post by ${user.name}`,
      description: post.content,
      creators: [`${process.env.NEXTAUTH_URL}/user/${userId}`],
      url: `${process.env.NEXTAUTH_URL}/post/${postId}`,
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
      <div className="flex flex-col bg-secondary-1 md:rounded-xl">
        <div className="flex justify-stretch">
          <div className="flex w-full flex-col items-stretch">
            <div>
              {post.thread && (
                <Thread
                  thread={post.thread.map(({ repliee }) => repliee)}
                  sessionUserId={session?.user.id}
                  isMainPost={true}
                />
              )}
              <PostView
                post={post}
                sessionUserId={session?.user.id}
                isMainPost={true}
              />
              {session?.user?.image && session?.user?.name ? (
                <PostCreator
                  send={async (
                    input: string,
                    urls: Substring[] | undefined,
                    metadata: IMetadata | undefined,
                  ) => {
                    "use server";
                    await postPost(
                      input,
                      session.user.id,
                      urls,
                      metadata,
                      post,
                    );
                    revalidatePath("/");
                  }}
                  sessionUser={session.user}
                />
              ) : (
                <SignInButton />
              )}
            </div>
          </div>
        </div>
      </div>
      {post.replies?.map((thread) => (
        <Thread
          key={`${thread[0]?.replierId}:thread`}
          thread={thread.map(({ replier }) => replier)}
          sessionUserId={session?.user.id}
        />
      ))}
    </>
  );
}
