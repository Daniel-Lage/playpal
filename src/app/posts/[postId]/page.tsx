import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getPost } from "~/server/get-post";
import { authOptions } from "~/lib/auth";
import { type IMetadata } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { PostPageView } from "~/components/views/post-page-view";
import { getReplies } from "~/server/get-replies";
import { ActionStatus } from "~/models/status.model";
import { ErrorPage } from "~/components/error-page";
import {
  parseBooleanCookie,
  parsePostsSortingColumnCookie,
} from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { generateText, type JSONContent } from "@tiptap/react";
import { generateTextExtensions } from "~/lib/generate-text-extensions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params: { postId },
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const post = await getPost(postId);

  if (!post)
    return {
      title: "Playpal | Post",
      description: "Post not found",
      openGraph: {
        images: ["/favicon.ico"],
        type: "article",
        url: `${process.env.NEXTAUTH_URL}/posts/${postId}`,
      },
    };

  const content = generateText(
    JSON.parse(post.content) as JSONContent,
    generateTextExtensions,
  );

  return {
    title: `Playpal | ${post?.author.name} | Post`,
    description: content,
    openGraph: {
      images: [post.author?.image ?? "/favicon.ico"],
      type: "article",
      authors: [`${process.env.NEXTAUTH_URL}/users/${post?.author.id}`],
      url: `${process.env.NEXTAUTH_URL}/posts/${postId}`,
    },
  };
}

export default async function PostPage({
  params: { postId },
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);

  const cookiePrefix = getCookiePrefix(session?.user.id);

  const cookieStore = cookies();
  const post = await getPost(postId);

  if (!post) return <ErrorPage />;

  const initialReversed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}replies_reversed`)?.value,
  );

  const initialSortingColumn = parsePostsSortingColumnCookie(
    cookieStore.get(`${cookiePrefix}replies_sorting_column`)?.value,
  );

  return (
    <PostPageView
      post={post}
      sessionUser={session?.user}
      lastQueried={new Date()}
      initialReversed={initialReversed}
      initialSortingColumn={initialSortingColumn}
      send={async (
        input: string,
        mentions: string[] | undefined,
        metadata: IMetadata | undefined,
      ) => {
        "use server";

        if (!session?.user) return ActionStatus.Failure;

        const result = await postPost(
          input,
          session?.user.id,
          mentions,
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
