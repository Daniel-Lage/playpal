"use client";

import Image from "next/image";
import Link from "next/link";

import { deletePost } from "~/server/queries";

import type { Session } from "next-auth";

import type { PostObject } from "~/models/post.model";

export function Post({
  post,
  session,
}: {
  post: PostObject;
  session?: Session | null;
}) {
  return (
    <div className="flex flex-col gap-2 bg-secondary p-2 md:rounded-xl">
      <div className="flex items-center justify-between">
        <Link
          className="flex items-center"
          href={`/profile/${post.author.providerAccountId}`}
        >
          <Image
            width={32}
            height={32}
            className="rounded-full"
            src={post.author?.image ?? ""}
            alt={post.author?.name ?? ""}
          />
          <div className="px-2 font-bold">{post.author?.name}</div>
        </Link>

        {session?.user?.id === post.userId && (
          <button onClick={() => deletePost(post.id)}>
            <Image height={24} width={24} src="/trash.png" alt="trash icon" />
          </button>
        )}
      </div>
      <Link href={`/post/${post.id}`}>{post.content}</Link>
    </div>
  );
}
