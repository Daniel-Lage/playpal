"use client";

import Image from "next/image";

import { deletePost } from "~/server/queries";

import type { PostWithMetadata } from "~/models/post.model";
import Link from "next/link";

export function Post({
  post,
  userId,
  focused,
}: {
  post: PostWithMetadata;
  userId?: string | null;
  focused?: boolean;
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
        <Link
          className="flex grow text-transparent"
          href={`/profile/${post.author.providerAccountId}/post/${post.id}`}
        >
          <div>ir a post</div>
        </Link>
        {userId === post.userId &&
          (focused ? (
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
          ))}
      </div>
      <FormattedContent post={post} />
      {post?.metadata?.og_url && (
        <Link
          href={post.metadata.og_url}
          className="flex items-start gap-2 rounded-lg bg-secondary2 p-2"
        >
          {post?.metadata?.og_image && (
            <Image
              width={100}
              height={100}
              className="rounded-md"
              src={post?.metadata?.og_image}
              alt={post.metadata.og_title ?? "image"}
            />
          )}
          <div className="grow overflow-hidden">
            <div className="w-full truncate text-left text-xl font-bold md:text-2xl">
              {post.metadata.og_title}
            </div>
            <div className="truncate text-left text-sm">
              {post.metadata.og_description}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

function FormattedContent({ post }: { post: PostWithMetadata }) {
  if (!post.urls)
    return (
      <Link href={`/profile/${post.author.providerAccountId}/post/${post.id}`}>
        {post.content}
      </Link>
    );

  const content = [];

  let contentIndex = 0;
  for (let index = 0; index < post.urls.length; index++) {
    const url = post.urls[index];
    if (url) {
      if (contentIndex != url.index)
        content.push(post.content.slice(contentIndex, url.index));
      content.push(url);
      contentIndex = url.index + url.url.length;
      if (index === post.urls.length - 1)
        if (contentIndex !== post.content.length)
          content.push(post.content.slice(contentIndex));
    }
  }

  return (
    <span>
      {content.map((value) => {
        if (typeof value === "string")
          return (
            <Link
              key={value}
              href={`/profile/${post.author.providerAccountId}/post/${post.id}`}
            >
              {value}
            </Link>
          );
        else
          return (
            <Link
              target="_blank"
              href={value.url}
              key={value.url}
              className="text-blue-700"
            >
              {value.url}
            </Link>
          );
      })}
    </span>
  );
}
