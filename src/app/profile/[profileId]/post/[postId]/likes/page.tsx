import { getServerSession } from "next-auth";
import { Post } from "~/app/_components/post";
import { User } from "~/app/_components/user";
import { authOptions } from "~/lib/auth";
import { getPostLikes } from "~/server/get-post-likes";

export default async function PostLikesPage({
  params: { postId },
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);
  const post = await getPostLikes(postId);

  if (!post)
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <>
      <div className="flex flex-col gap-1 bg-main md:rounded-xl">
        <Post post={post} sessionUserId={session?.user.id} focused={true} />
        <div className="text-center font-bold">Liked By</div>
      </div>
      {post.likes.map(
        (like) => like?.liker && <User key={like.userId} user={like.liker} />,
      )}
    </>
  );
}
