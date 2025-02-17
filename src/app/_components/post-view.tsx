"use client";

import Image from "next/image";

import {
  type MainPostObject,
  type PostObject,
  type Substring,
} from "~/models/post.model";
import Link from "next/link";
import { LikeButton } from "./like-button";
import { DeleteButton } from "./delete-button";
import { formatTimelapse } from "~/helpers/format-timelapse";

export function PostView({
  post,
  sessionUserId,
  isMainPost,
}: {
  post: MainPostObject | PostObject;
  sessionUserId?: string | null;
  isMainPost?: boolean;
}) {
  return (
    <div className={"flex items-stretch rounded-md bg-secondary-1"}>
      <Link
        href={`/user/${post.author.id}`}
        className="shrink-0 grow-0 self-start"
      >
        <Image
          width={40}
          height={40}
          className="aspect-square h-14 w-14 shrink-0 grow-0 rounded-full p-2"
          src={post.author?.image ?? ""}
          alt={post.author?.name ?? ""}
        />
      </Link>

      <div className="flex grow flex-col gap-2 p-2 pl-0">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center hover:underline"
            href={`/user/${post.author.id}`}
          >
            <div className="font-bold">{post.author?.name}</div>
          </Link>
          <Link className="flex h-full grow pl-2" href={`/post/${post.id}`}>
            {formatTimelapse(Date.now() - post.createdAt.getTime()) ??
              post.createdAt.toUTCString()}
          </Link>
          <DeleteButton {...{ post, sessionUserId, isMainPost }} />
        </div>

        <FormattedContent
          input={post.content}
          urls={post.urls}
          ownUrl={`/post/${post.id}`}
        />

        {post?.urlMetadata?.og_url && (
          <Link
            href={post.urlMetadata.og_url}
            className="flex items-start gap-2 rounded-md bg-secondary-2 p-2"
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
            <Link href={`/post/${post.id}/likes`}>{post.likes?.length}</Link>
          </div>
          <Link className="flex w-1/2 gap-2" href={`/post/${post.id}`}>
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
          className="whitespace-pre text-blue-700 hover:underline"
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
