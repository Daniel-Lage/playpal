"use client";

import Image from "next/image";

import {
  type MainPostObject,
  type PostObject,
  type Substring,
} from "~/models/post.model";
import Link from "next/link";
import { LikeButton } from "./like-button";
import { formatTimelapse } from "~/helpers/format-timelapse";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import type { LikeObject } from "~/models/like.model";
import { ShareButton } from "./share-button";
import { MessageSquare, Trash } from "lucide-react";
import { MenuView } from "./menu-view";
import { useRouter } from "next/navigation";
import { deletePost } from "~/server/delete-post";

export function PostView({
  post: postProp,
  sessionUserId,
  isCutoff,
  isLastPost = true,
  CutOff,
  isMainPost = false,
}: {
  post: MainPostObject | PostObject;
  sessionUserId?: string | null;
  isCutoff?: boolean;
  isLastPost?: boolean;
  CutOff?: () => void;
  isMainPost?: boolean;
}) {
  const router = useRouter();

  const [post, setPost] = useState(postProp);

  useEffect(() => {
    setPost(postProp);
  }, [postProp]);

  const [isLiked, setIsLiked] = useState(
    post.likes?.some((like) => like.userId === sessionUserId),
  );

  useEffect(() => {
    const like = post.likes?.findIndex((like) => like.userId === sessionUserId);

    if (isLiked && like === -1)
      setPost((prev) =>
        prev.likes
          ? {
              ...prev,
              likes: [
                ...prev.likes,
                {
                  userId: sessionUserId,
                  createdAt: new Date(),
                  postId: prev.id,
                } as LikeObject,
              ],
            }
          : prev,
      );
    else if (!isLiked && like !== -1)
      setPost((prev) =>
        prev.likes
          ? {
              ...prev,
              likes: prev.likes.filter((_, i) => i !== like),
            }
          : prev,
      );
  }, [isLiked, sessionUserId, post.likes]);

  return (
    <div className="flex flex-col rounded-md bg-secondary px-2">
      <div className="flex h-12 items-center">
        <Link
          href={`/user/${post.author.id}`}
          className="flex h-12 w-12 items-center justify-center"
        >
          <Image
            width={32}
            height={32}
            className="aspect-square rounded-full"
            src={post.author?.image ?? ""}
            alt={post.author?.name ?? ""}
          />
        </Link>
        <Link
          className="inline items-center font-bold hover:underline"
          href={`/user/${post.author.id}`}
        >
          {post.author?.name}
        </Link>
        <div className="whitespace-pre"> · </div>
        <Link
          className="inline grow items-center hover:underline"
          href={`/post/${post.id}`}
        >
          {formatTimelapse(Date.now() - post.createdAt.getTime()) ??
            post.createdAt.toUTCString()}
        </Link>
        <MenuView>
          <Button
            size="select"
            onClick={() => {
              if (isMainPost) router.back();

              void deletePost(post.id);
            }}
          >
            Delete post
            <Trash />
          </Button>
        </MenuView>
      </div>

      <div className="flex grow overflow-hidden text-wrap">
        {!isLastPost && (
          <button
            className="relative flex min-h-full w-12 items-center justify-center gap-2"
            onClick={CutOff}
          >
            {isCutoff ? (
              <>
                <div className="absolute h-5 w-1 rounded-md bg-foreground"></div>
                <div className="absolute h-1 w-5 rounded-md bg-foreground"></div>
              </>
            ) : (
              <>
                <div className="h-full w-1 rounded-md bg-foreground"></div>
              </>
            )}
          </button>
        )}
        <div className="flex grow flex-col justify-between">
          <FormattedContent
            input={post.content}
            urls={post.urls}
            ownUrl={`/post/${post.id}`}
          />

          {post?.urlMetadata?.og_url && (
            <Link
              href={post.urlMetadata.og_url}
              className="flex items-start gap-2 rounded-md bg-secondary-accent p-2"
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

          <div className="flex h-12 items-center justify-between font-bold">
            <div className="flex items-center gap-2">
              <LikeButton {...{ post, sessionUserId, isLiked, setIsLiked }} />
              <Link href={`/post/${post.id}/likes`} className="hover:underline">
                {post.likes?.length ?? 0}
              </Link>
            </div>
            <Link
              className="flex items-center gap-2 hover:underline"
              href={`/post/${post.id}`}
            >
              <Button>
                <MessageSquare />
              </Button>
              <div>{post.replies?.length ?? 0}</div>
            </Link>
            <ShareButton path={`/post/${post.id}`} />
          </div>
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
          <Link href={ownUrl} key={index} className="inline whitespace-pre">
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
          className="inline whitespace-pre text-blue-700 hover:underline"
        >
          {value}
        </Link>,
      );
      contentIndex = url.start + url.length;

      if (index === urls.length - 1) {
        if (contentIndex !== input.length) {
          const value = input.slice(contentIndex);
          content.push(
            <Link href={ownUrl} key={index} className="inline whitespace-pre">
              {value}
            </Link>,
          );
        }
      }
    }
  }

  return content;
}
