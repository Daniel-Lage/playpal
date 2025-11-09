import { getServerSession } from "next-auth";
import type { Metadata } from "next";

import { getPost } from "~/server/get-post";
import { getUser } from "~/server/get-user";
import { authOptions } from "~/lib/auth";
import { type IMetadata, type Substring } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { PostPageView } from "./post-page-view";
import { getReplies } from "~/server/get-replies";
import { ActionStatus } from "~/models/status.model";

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
    return (
      <div className="self-center text-xl text-secondary">Post Not Found</div>
    );

  return (
    <PostPageView
      post={post}
      sessionUser={session?.user}
      lastQueried={new Date()}
      send={async (
        input: string,
        urls: Substring[] | undefined,
        metadata: IMetadata | undefined,
      ) => {
        "use server";

        if (!session?.user) return ActionStatus.Failure; // shouldn't be able to be called if not logged in

        const result = await postPost(
          input,
          session?.user.id,
          urls,
          metadata,
          post,
        );
        revalidatePath("/");
        return result;
      }}
      refresh={async (lastQueried: Date) => {
        "use server";
        return await getReplies(postId, lastQueried);
      }}
    />
  );
}
