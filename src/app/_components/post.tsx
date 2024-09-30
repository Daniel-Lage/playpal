"use client";

import Image from "next/image";

import { deletePost, likePost, unlikePost } from "~/server/queries";

import type {
  ClientPostObject,
  PostObject,
  Substring,
} from "~/models/post.model";
import Link from "next/link";

export function Post({
  post,
  userId,
  focused,
}: {
  post: ClientPostObject | PostObject;
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
        <DeleteButton {...{ post, userId, focused }} />
      </div>
      {post.urls ? (
        <FormattedContent
          input={post.content}
          urls={post.urls}
          ownUrl={`/profile/${post.author.providerAccountId}/post/${post.id}`}
        />
      ) : (
        <Link
          href={`/profile/${post.author.providerAccountId}/post/${post.id}`}
        >
          {post.content}
        </Link>
      )}

      {post?.urlMetadata?.og_url && (
        <Link
          href={post.urlMetadata.og_url}
          className="flex items-start gap-2 rounded-lg bg-secondary2 p-2"
        >
          {post?.urlMetadata?.og_image && (
            <Image
              width={100}
              height={100}
              className="rounded-md"
              src={post?.urlMetadata?.og_image}
              alt={post.urlMetadata.og_title ?? "image"}
            />
          )}
          <div className="grow overflow-hidden">
            <div className="w-full truncate text-left text-xl font-bold md:text-2xl">
              {post.urlMetadata.og_title}
            </div>
            <div className="truncate text-left text-sm">
              {post.urlMetadata.og_description}
            </div>
          </div>
        </Link>
      )}
      <div className="flex items-center font-bold">
        <div className="flex w-1/2 gap-2">
          <LikeButton {...{ post, userId }} />
          <Link
            href={`/profile/${post.author.providerAccountId}/post/${post.id}/likes`}
          >
            {post.likes?.length}
          </Link>
        </div>
        <Link
          className="flex w-1/2 gap-2"
          href={`/profile/${post.author.providerAccountId}/post/${post.id}`}
        >
          <Image height={24} width={24} src="/reply.png" alt="reply icon" />
          {post.replies?.length ?? 0}
        </Link>
      </div>
    </div>
  );
}

function FormattedContent({
  input,
  urls,
  ownUrl,
}: {
  input: string;
  ownUrl: string;
  urls: Substring[];
}) {
  const content: string[] = [];
  const urlIndexes = new Set<number>();

  let contentIndex = 0;
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    if (url) {
      if (contentIndex != url.start) {
        content.push(input.slice(contentIndex, url.start));
      }

      content.push(input.slice(url.start, url.start + url.length));
      urlIndexes.add(content.length - 1);
      contentIndex = url.start + url.length;

      if (index === urls.length - 1) {
        if (contentIndex !== input.length) {
          content.push(input.slice(contentIndex));
        }
      }
    }
  }

  return content.map((value, index) => {
    if (urlIndexes.has(index))
      return (
        <Link
          target="_blank"
          href={value}
          key={index}
          className="text-blue-700"
        >
          {value}
        </Link>
      );
    else
      return (
        <Link key={index} href={ownUrl}>
          {value}
        </Link>
      );
  });
}

function DeleteButton({
  post,
  userId,
  focused,
}: {
  post: ClientPostObject | PostObject;
  userId?: string | null;
  focused?: boolean;
}) {
  if (userId === post.userId) {
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

function LikeButton({
  post,
  userId,
}: {
  post: ClientPostObject | PostObject;
  userId?: string | null;
}) {
  if (userId) {
    if (post.likes?.some((like) => like.userId === userId))
      return (
        <button onClick={() => unlikePost(post.id, userId)}>
          <Image height={24} width={24} src="/liked.png" alt="liked icon" />
        </button>
      );
    return (
      <button onClick={() => likePost(post.id, userId)}>
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
