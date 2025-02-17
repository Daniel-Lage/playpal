"use client";

import { useState } from "react";
import { PostView } from "~/app/_components/post-view";
import type { PostObject } from "~/models/post.model";

export function Thread({
  thread,
  sessionUserId,
  isMainPost,
}: {
  thread: (PostObject | undefined)[];
  sessionUserId: string | null | undefined;
  isMainPost?: boolean;
}) {
  const [cutoff, setCutoff] = useState(thread.length - 1);

  return (
    <div className="flex flex-col justify-stretch rounded-md bg-secondary-1">
      {thread.map(
        (post, index) =>
          post &&
          index <= cutoff && (
            <div key={post.id} className="relative">
              <PostView post={post} sessionUserId={sessionUserId} />
              {isMainPost ? (
                <div className="absolute top-[56px] flex h-[calc(100%-56px)] w-14 justify-center">
                  <div className="h-full w-1 rounded-md bg-background"></div>
                </div>
              ) : (
                index !== thread.length - 1 &&
                (index === cutoff ? (
                  <button
                    className="absolute top-[56px] flex h-[calc(100%-56px)] w-14 items-center justify-center"
                    onClick={() => {
                      setCutoff(thread.length - 1);
                    }}
                  >
                    <div className="absolute h-5 w-1 rounded-md bg-background"></div>
                    <div className="absolute h-1 w-5 rounded-md bg-background"></div>
                  </button>
                ) : (
                  <button
                    className="absolute top-[56px] flex h-[calc(100%-56px)] w-14 justify-center"
                    onClick={() => {
                      setCutoff(index);
                    }}
                  >
                    <div className="h-full w-1 rounded-md bg-background"></div>
                  </button>
                ))
              )}
            </div>
          ),
      )}
    </div>
  );
}
