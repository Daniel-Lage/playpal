import { getServerSession } from "next-auth";
import { PageView } from "~/components/page-view";
import { PostView } from "~/components/post-view";
import { UserFeedView } from "~/components/user-feed-view";
import { authOptions } from "~/lib/auth";
import type { UserObject } from "~/models/user.model";
import { getPostLikes } from "~/server/get-post-likes";

export default async function PostLikesPage({
  params: { postId },
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await getPostLikes(postId);

  if (!post)
    return <div className="self-center text-xl text-secondary">Error</div>;

  return (
    <PageView>
      <div className="flex flex-col gap-1 bg-secondary">
        <PostView
          post={post}
          sessionUserId={session?.user.id}
          isMainPost={true}
          hasReplyBox={false}
        />
        <div className="text-center font-bold">Liked By</div>
      </div>

      {post?.likes && post.likes.length > 0 && (
        <UserFeedView
          users={post?.likes
            .map((like) => like?.liker as UserObject)
            .filter((user) => !!user)}
        />
      )}
    </PageView>
  );
}
