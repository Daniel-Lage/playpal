import Image from "next/image";
import Link from "next/link";
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
  return !sessionUserId ? (
    <Link href={"/api/auth/signin"}>
      <Image height={24} width={24} src="/unliked.png" alt="unliked icon" />
    </Link>
  ) : post.likes?.some((like) => like.userId === sessionUserId) ? (
    <button onClick={() => unlikePost(post.id, sessionUserId)}>
      <Image height={24} width={24} src="/liked.png" alt="liked icon" />
    </button>
  ) : (
    <button onClick={() => likePost(post.id, sessionUserId)}>
      <Image height={24} width={24} src="/unliked.png" alt="unliked icon" />
    </button>
  );
}
