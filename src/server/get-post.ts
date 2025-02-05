"use server";
import { eq, desc } from "drizzle-orm";
import type { MainPostObject, PostObject } from "~/models/post.model";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";
import { getReplyThread } from "./get-reply-thread";

export async function getPost(
  postId: string,
): Promise<MainPostObject | undefined> {
  const post = (await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
    with: {
      author: true,
      likes: true,
      thread: {
        orderBy: [desc(repliesTable.separation)],
        with: {
          repliee: {
            with: {
              author: true,
              likes: true,
              replies: {
                // only gets direct replies
                where: eq(repliesTable.separation, 0),
              },
            },
          },
        },
      },
      replies: {
        with: {
          replier: {
            with: {
              author: true,
              likes: true,
              replies: {
                // only gets direct replies
                where: eq(repliesTable.separation, 0),
              },
            },
          },
        },
      },
    },
  })) as PostObject;

  if (post?.replies) {
    const replies = post.replies
      .filter((reply) => reply.separation === 0)
      .map((reply) => [reply]);

    for (const replyThread of replies) {
      await getReplyThread(replyThread, post.replies);
    }

    return { ...post, replies } as MainPostObject;
  }

  return { ...post, replies: undefined } as MainPostObject;
}
