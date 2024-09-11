"use client";

import Image from "next/image";
import Link from "next/link";
import type { MetaData } from "metadata-scraper";

import { deletePost } from "~/server/queries";

import type { PostObject } from "~/models/post.model";

export function Post({
  post,
  userId,
  focused,
  link,
}: {
  post: PostObject;
  userId?: string | null;
  focused?: boolean;
  link: MetaData | null;
}) {
  return (
    <div
      className={
        focused
          ? "flex flex-col gap-2 bg-secondary p-2 md:rounded-t-xl"
          : "flex flex-col gap-2 bg-secondary p-2 md:rounded-xl"
      }
    >
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

        {userId === post.userId && focused ? (
          <Link
            href={
              post.thread.length > 0
                ? `/profile/${post.author.providerAccountId}/post/${post.thread.pop()}`
                : "/"
            }
            onClick={() => deletePost(post.id)}
          >
            <Image height={24} width={24} src="/trash.png" alt="trash icon" />
          </Link>
        ) : (
          <button onClick={() => deletePost(post.id)}>
            <Image height={24} width={24} src="/trash.png" alt="trash icon" />
          </button>
        )}
      </div>
      <Link href={`/profile/${post.author.providerAccountId}/post/${post.id}`}>
        {post.content}
      </Link>
      {link?.url && link.image && link.title && (
        <Link
          href={link.url}
          className="flex items-center gap-2 rounded-lg bg-secondary2 p-2"
        >
          <Image
            width={40}
            height={40}
            className="rounded-md"
            src={link.image}
            alt={link.title}
          />
          <div>{link.title}</div>
          <div>{link.description}</div>
        </Link>
      )}
    </div>
  );
}
