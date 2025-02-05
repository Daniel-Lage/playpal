import Image from "next/image";
import Link from "next/link";
import type { MainPostObject, PostObject } from "~/models/post.model";
import { deletePost } from "~/server/delete-post";

export function DeleteButton({
  post,
  sessionUserId,
  focused,
}: {
  post: MainPostObject | PostObject;
  sessionUserId?: string | null;
  focused?: boolean;
}) {
  if (sessionUserId === post.userId) {
    if (focused)
      return (
        <Link href={"/"} onClick={() => deletePost(post.id)}>
          <Image height={24} width={24} src="/trash.png" alt="trash icon" />
        </Link>
      );
    return (
      <button onClick={() => deletePost(post.id)}>
        <Image height={24} width={24} src="/trash.png" alt="trash icon" />
      </button>
    );
  }
}
