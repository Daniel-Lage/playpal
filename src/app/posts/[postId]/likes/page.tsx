import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { PostView } from "~/components/views/post-view";
import { UserFeedView } from "~/components/views/user-feed-view";
import { authOptions } from "~/lib/auth";
import { generateTextExtensions } from "~/lib/generate-text-extensions";
import type { UserObject } from "~/models/user.model";
import { getPost } from "~/server/get-post";
import { getPostLikes } from "~/server/get-post-likes";
import { generateText, type JSONContent } from "@tiptap/react";

export async function generateMetadata({
  params: { postId },
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const post = await getPost(postId);

  if (!post)
    return {
      title: "Playpal | Post likes",
      description: "Post not found",
      openGraph: {
        images: ["/favicon.ico"],
        type: "article",
        url: `${process.env.NEXTAUTH_URL}/posts/${postId}/likes`,
      },
    };

  const content = generateText(
    JSON.parse(post.content) as JSONContent,
    generateTextExtensions,
  );

  return {
    title: `Playpal | ${post?.author.name} | Post likes`,
    description: content,
    openGraph: {
      images: [post?.author?.image ?? "/favicon.ico"],
      type: "article",
      authors: [`${process.env.NEXTAUTH_URL}/users/${post?.author.id}`],
      url: `${process.env.NEXTAUTH_URL}/posts/${postId}/likes`,
    },
  };
}

export default async function PostLikesPage({
  params: { postId },
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await getPostLikes(postId);

  if (!post)
    return <div className="self-center text-xl text-primary">Error</div>;

  return (
    <>
      <div className="flex flex-col gap-1 bg-container">
        <PostView
          post={post}
          sessionUserId={session?.user.id}
          isMainPost={true}
          hasReplyBox={false}
        />
        <div className="ml-2 font-bold">Liked By</div>
      </div>

      {post?.likes && post.likes.length > 0 && (
        <UserFeedView
          users={post?.likes
            .map((like) => like?.liker as UserObject)
            .filter((user) => !!user)}
        />
      )}
    </>
  );
}
