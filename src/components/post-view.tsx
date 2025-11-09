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
import { ShareButton } from "./share-button";
import { MessageSquare, Trash } from "lucide-react";
import { MenuView } from "./menu-view";
import { useRouter } from "next/navigation";
import { deletePost } from "~/server/delete-post";
import { unlikePost } from "~/server/unlike-post";
import { likePost } from "~/server/like-post";
import { cn } from "~/lib/utils";
import { UserImage } from "./user-image";
import { ConfirmDialog } from "./confirm-dialog";

export function PostView({
  post,
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

  return (
    <div
      className={cn(
        "flex flex-col rounded-md bg-secondary px-2",
        isMainPost ? "bg-primary" : "bg-secondary",
      )}
    >
      <div className="flex h-12 items-center text-xs md:text-base">
        <Link
          href={`/user/${post.author.id}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <UserImage
            size={32}
            image={post.author.image}
            name={post.author.name}
          />
        </Link>
        <Link
          className="inline items-center text-base font-bold hover:underline"
          href={`/user/${post.author.id}`}
        >
          {post.author?.name}
        </Link>
        <div className="whitespace-pre"> · </div>
        <Link
          className={cn(
            "inline items-center text-nowrap hover:underline",
            !post.likes || (post.likes.length === 0 && "grow"),
          )}
          href={`/post/${post.id}`}
        >
          {formatTimelapse(Date.now() - post.createdAt.getTime()) ??
            post.createdAt.toUTCString()}
        </Link>

        {post.likes && post.likes.length !== 0 && (
          <>
            <div className="whitespace-pre"> · </div>
            <Link
              className="inline grow items-center overflow-hidden text-ellipsis text-nowrap hover:underline"
              href={`/post/${post.id}/likes`}
            >
              Liked by{" "}
              {post.likes
                .slice(0, 2)
                .map((like) =>
                  like.liker?.id === sessionUserId ? "You" : like.liker?.name,
                )
                .join(", ")}{" "}
              {post.likes.length > 2 && `and ${post.likes.length - 1} more...`}
            </Link>
          </>
        )}
        <MenuView>
          <ConfirmDialog
            onConfirm={() => {
              if (isMainPost) router.back();

              void deletePost(post.id);
            }}
            title="Delete Post?"
            description="This action cannot be undone."
          >
            <Button size="select">
              Delete post
              <Trash />
            </Button>
          </ConfirmDialog>
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
                <div className="absolute h-3 w-1 rounded-md bg-foreground"></div>
                <div className="absolute h-1 w-3 rounded-md bg-foreground"></div>
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

          <div className="grid h-12 grid-cols-3 items-center justify-between font-bold">
            <LikeButton
              hasLike={
                !!post.likes?.some((like) => like.userId === sessionUserId)
              }
              count={post.likes?.length ?? 0}
              sessionUserId={sessionUserId}
              href={`/post/${post.id}/likes`}
              unlike={(suid: string) => unlikePost(post.id, suid)}
              like={(suid: string) => likePost(post.id, suid)}
            />
            <Link
              className="flex items-center justify-center gap-2 hover:underline"
              href={`/post/${post.id}`}
            >
              <Button size="icon">
                <MessageSquare />
              </Button>
              <div>
                {"replyThreads" in post
                  ? post.replyThreads?.length
                  : "replies" in post
                    ? (post.replies.length ?? 0)
                    : 0}
              </div>
            </Link>
            <div className="flex items-center justify-end">
              <ShareButton path={`/post/${post.id}`} />
            </div>
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
