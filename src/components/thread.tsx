"use client";
import { useState } from "react";
import { PostView } from "~/components/post-view";
import { cn } from "~/lib/utils";
import type { PostObject } from "~/models/post.model";

export function Thread({
  thread,
  sessionUserId,
  isMainPost = false,
}: {
  thread: (PostObject | undefined)[];
  sessionUserId: string | null | undefined;
  isMainPost?: boolean;
}) {
  const [cutoff, setCutoff] = useState(thread.length - 1);

  return (
    <div
      className={cn(
        "flex flex-col justify-stretch rounded-md",
        isMainPost ? "bg-secondary" : "bg-secondary",
      )}
    >
      {thread.map(
        (post, index) =>
          post &&
          index <= cutoff && (
            <PostView
              isMainPost={isMainPost}
              key={post.id}
              post={post}
              sessionUserId={sessionUserId}
              isCutoff={index === cutoff}
              isLastPost={index === thread.length - 1}
              CutOff={() =>
                isMainPost ||
                setCutoff(index === cutoff ? thread.length - 1 : index)
              }
            />
          ),
      )}
    </div>
  );
}
