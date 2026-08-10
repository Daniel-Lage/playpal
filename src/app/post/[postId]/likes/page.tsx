import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { PageView } from "~/components/page-view";
import { PostView } from "~/components/post-view";
import { UserFeedView } from "~/components/user-feed-view";
import { authOptions } from "~/lib/auth";
import type { UserObject } from "~/models/user.model";
import { getPostLikes } from "~/server/get-post-likes";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export default async function PostLikesPage({
  params: { postId },
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const post = await getPostLikes(postId);

  if (!post)
    return <div className="self-center text-xl text-primary">Error</div>;

  return (
    <PageView
      sessionUser={session?.user}
      initialCollapsed={
        cookieStore.get(
          storageKeyToCookieName(`${session?.user.id}:side_bar_collapsed`),
        )?.value === "true"
      }
    >
      <div className="bg-container flex flex-col gap-1">
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
    </PageView>
  );
}
