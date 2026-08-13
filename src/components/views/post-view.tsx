"use client";

import { type MainPostObject, type PostObject } from "~/models/post.model";
import Link from "next/link";
import { LikeButton } from "../buttons/like-button";
import { formatTimelapse } from "~/helpers/format-timelapse";

import { ShareButton } from "../buttons/share-button";
import { Trash, UserRound } from "lucide-react";
import { MenuView } from "../menu-view";
import { useRouter } from "next/navigation";
import { deletePost } from "~/server/delete-post";
import { unlikePost } from "~/server/unlike-post";
import { likePost } from "~/server/like-post";
import { cn } from "~/lib/utils";
import { UserImage } from "../user-image";
import { ConfirmDialog } from "../confirm-dialog";
import { MenuButton } from "../buttons/menu-button";
import { ContentRenderer } from "../content-renderer";
import { MetadataCard } from "../metadata-card";
import { RepliesButton } from "../buttons/replies-button";

export function PostView({
  post,
  sessionUserId,
  isCutoff,
  isLastPost = true,
  CutOff,
  isMainPost = false,
  hasReplyBox = false,
}: {
  post: MainPostObject | PostObject;
  sessionUserId?: string | null;
  isCutoff?: boolean;
  isLastPost?: boolean;
  CutOff?: () => void;
  isMainPost?: boolean;
  hasReplyBox?: boolean;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-container px-2",
        !isMainPost && "rounded-md border",
      )}
    >
      <div className="flex h-12 items-center text-xs md:text-base">
        <Link
          href={`/users/${post.author.id}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <UserImage
            size={40}
            image={post.author.image}
            name={post.author.name}
          />
        </Link>
        <Link
          className="inline items-center text-base font-bold hover:underline"
          href={`/users/${post.author.id}`}
        >
          {post.author?.name}
        </Link>
        <div className="whitespace-pre"> · </div>
        <Link
          className={cn(
            "inline items-center text-nowrap hover:underline",
            !post.likes || (post.likes.length === 0 && "grow"),
          )}
          href={`/posts/${post.id}`}
        >
          {formatTimelapse(Date.now() - post.createdAt.getTime()) ??
            post.createdAt.toUTCString()}
        </Link>

        {post.likes && post.likes.length > 0 && (
          <>
            <div className="whitespace-pre"> · </div>
            <Link
              className="inline grow items-center overflow-hidden text-ellipsis text-nowrap hover:underline"
              href={`/posts/${post.id}/likes`}
            >
              Liked by{" "}
              {post.likes
                .slice(0, 2)
                .map((like) =>
                  like.liker?.id === sessionUserId ? "You" : like.liker?.name,
                )
                .join(", ")}{" "}
              {post.likes.length > 2 && `and ${post.likes.length - 2} more...`}
            </Link>
          </>
        )}
        <MenuView>
          {sessionUserId === post.author.id && (
            <ConfirmDialog
              onConfirm={() => {
                if (isMainPost) router.back();

                void deletePost(post.id);
              }}
              title="Delete Post?"
              description="This action cannot be undone."
            >
              <MenuButton>
                <Trash />
                Delete post
              </MenuButton>
            </ConfirmDialog>
          )}
          <Link href={`/users/${post.author.id}`}>
            <MenuButton>
              <UserRound />
              Visit users page
            </MenuButton>
          </Link>
        </MenuView>
      </div>

      <div className="flex grow overflow-hidden text-wrap">
        {isMainPost && hasReplyBox ? (
          <div className="relative flex min-h-full w-12 items-center justify-center gap-2">
            <div className="h-full w-[2px] rounded-md bg-foreground"></div>
          </div>
        ) : (
          !isLastPost && (
            <button
              className="relative flex min-h-full w-12 items-center justify-center gap-2"
              onClick={CutOff}
            >
              {isCutoff ? (
                <>
                  <div className="absolute h-3 w-[2px] rounded-md bg-foreground"></div>
                  <div className="absolute h-[2px] w-3 rounded-md bg-foreground"></div>
                </>
              ) : (
                <>
                  <div className="h-full w-[2px] rounded-md bg-foreground"></div>
                </>
              )}
            </button>
          )
        )}
        <div className="flex grow flex-col justify-between overflow-hidden">
          <ContentRenderer content={post.content} />

          {post?.urlMetadata && <MetadataCard metadata={post?.urlMetadata} />}

          <div className="grid h-12 grid-cols-3">
            <LikeButton
              hasLike={
                !!post.likes?.some((like) => like.userId === sessionUserId)
              }
              count={post.likes?.length ?? 0}
              sessionUserId={sessionUserId}
              href={`/posts/${post.id}/likes`}
              unlike={(suid: string) => unlikePost(post.id, suid)}
              like={(suid: string) => likePost(post.id, suid)}
            />

            <RepliesButton
              count={
                "replyThreads" in post
                  ? (post.replyThreads?.length ?? 0)
                  : "replies" in post
                    ? (post.replies.length ?? 0)
                    : 0
              }
              href={`/posts/${post.id}`}
            />

            <div className="flex items-center justify-end">
              <ShareButton path={`/posts/${post.id}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
