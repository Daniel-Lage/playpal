"use client";

import { useState } from "react";
import { PostView } from "~/components/post-view";
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
    <div className="flex flex-col justify-stretch rounded-md bg-secondary">
      {thread.map(
        (post, index) =>
          post &&
          index <= cutoff && (
            <PostView
              key={post.id}
              post={post}
              sessionUserId={sessionUserId}
              isCutoff={isMainPost ? false : index === cutoff}
              isLastPost={isMainPost ? false : index === thread.length - 1}
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
