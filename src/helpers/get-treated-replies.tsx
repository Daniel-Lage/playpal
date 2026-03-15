"use client";
import { type PostObject, PostsSortingColumn } from "~/models/post.model";

export function getTreatedReplies(
  replies: PostObject[][],
  sortingColumn: PostsSortingColumn,
) {
  return replies.sort((replyThreadA, replyThreadB) => {
    const key = {
      // compares first post of thread
      [PostsSortingColumn.Likes]: (thread: PostObject[]) =>
        thread[0]?.likes?.length,
      [PostsSortingColumn.Replies]: (thread: PostObject[]) =>
        thread[0]?.replies.length,
      [PostsSortingColumn.CreatedAt]: (thread: PostObject[]) =>
        thread[0]?.createdAt,
    }[sortingColumn];

    const keyA = key(replyThreadA);
    const keyB = key(replyThreadB);

    if (!keyA || !keyB) return 0;
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}
