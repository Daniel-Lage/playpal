import Image from "next/image";
import type { MainPostObject, PostObject } from "~/models/post.model";
import { likePost } from "~/server/like-post";
import { unlikePost } from "~/server/unlike-post";

export function LikeButton({
  post,
  sessionUserId,
}: {
  post: MainPostObject | PostObject;
  sessionUserId?: string | null;
}) {
  if (sessionUserId) {
    if (post.likes?.some((like) => like.userId === sessionUserId))
      return (
        <button onClick={() => unlikePost(post.id, sessionUserId)}>
          <Image height={24} width={24} src="/liked.png" alt="liked icon" />
        </button>
      );
    return (
      <button onClick={() => likePost(post.id, sessionUserId)}>
        <Image height={24} width={24} src="/unliked.png" alt="unliked icon" />
      </button>
    );
  }
  return (
    // eventually open modal to login
    <button>
      <Image height={24} width={24} src="/unliked.png" alt="unliked icon" />
    </button>
  );
}
