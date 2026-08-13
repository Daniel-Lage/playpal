import { getServerSession } from "next-auth";
import { PostView } from "~/components/views/post-view";
import { UserFeedView } from "~/components/views/user-feed-view";
import { authOptions } from "~/lib/auth";
import type { UserObject } from "~/models/user.model";
import { getPostLikes } from "~/server/get-post-likes";

export default async function PostLikesMainPage({
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
