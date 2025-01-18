"use client";

import Image from "next/image";

import { deletePost, likePost, unlikePost } from "~/server/queries";

import {
  type ClientPostObject,
  type PostObject,
  type Substring,
  threadPosition,
} from "~/models/post.model";
import Link from "next/link";

export function Post({
  post,
  sessionUserId,
  focused,
  position,
}: {
  post: ClientPostObject | PostObject;
  sessionUserId?: string | null;
  focused?: boolean;
  position?: threadPosition;
}) {
  return (
    <div
      className={
        focused
          ? "flex items-stretch gap-2 bg-secondary md:rounded-t-xl"
          : "flex items-stretch gap-2 bg-secondary md:rounded-xl"
      }
    >
      <div className="flex shrink-0 flex-col items-center gap-2 pl-4">
        <div
          className={`h-2 w-1 rounded-b-xl ${position && position !== threadPosition.First ? "bg-gray-700" : ""}`}
        ></div>
        <Image
          width={40}
          height={40}
          className="rounded-full"
          src={post.author?.image ?? ""}
          alt={post.author?.name ?? ""}
        />
        <div
          className={`w-1 grow rounded-t-xl ${position && position !== threadPosition.Last ? "bg-gray-700" : ""}`}
        ></div>
      </div>

      <div className="flex grow flex-col gap-2 p-2 pl-0">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center"
            href={`/profile/${post.author.providerAccountId}`}
          >
            <div className="font-bold">{post.author?.name}</div>
          </Link>
          <Link
            className="flex h-full grow"
            href={`/profile/${post.author.providerAccountId}/post/${post.id}`}
          ></Link>
          <DeleteButton {...{ post, sessionUserId, focused }} />
        </div>

        <FormattedContent
          input={post.content}
          urls={post.urls}
          ownUrl={`/profile/${post.author.providerAccountId}/post/${post.id}`}
        />

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
            <LikeButton {...{ post, sessionUserId }} />
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
  urls?: Substring[] | null;
}) {
  if (!urls) return <Link href={ownUrl}>{input}</Link>;

  const content: JSX.Element[] = [];

  let contentIndex = 0;
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    if (url) {
      if (contentIndex != url.start) {
        const value = input.slice(contentIndex, url.start);
        content.push(
          <Link href={ownUrl} key={index} className="whitespace-pre">
            {value}
          </Link>,
        );
      }
      const value = input.slice(url.start, url.start + url.length);
      content.push(
        <Link
          target="_blank"
          href={value}
          key={index}
          className="whitespace-pre text-blue-700"
        >
          {value}
        </Link>,
      );
      contentIndex = url.start + url.length;

      if (index === urls.length - 1) {
        if (contentIndex !== input.length) {
          const value = input.slice(contentIndex);
          content.push(
            <Link href={ownUrl} key={index} className="whitespace-pre">
              {value}
            </Link>,
          );
        }
      }
    }
  }

  return content;
}

function DeleteButton({
  post,
  sessionUserId,
  focused,
}: {
  post: ClientPostObject | PostObject;
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

function LikeButton({
  post,
  sessionUserId,
}: {
  post: ClientPostObject | PostObject;
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
