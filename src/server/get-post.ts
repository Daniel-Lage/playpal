"use server";
import { eq, desc } from "drizzle-orm";
import type { MainPostObject, PostObject } from "~/models/post.model";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";
import { Threadify } from "~/helpers/get-reply-thread";
import type { ReplyObject } from "~/models/reply.model";

export async function getPost(
  postId: string,
): Promise<MainPostObject | undefined> {
  const post = (await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
    with: {
      author: true,
      likes: { with: { liker: true } },
      playlist: { with: { owner: true } },
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

  if (!post) return undefined;

  if (post?.replies) {
    const replyThreads = post.replies
      .filter((reply) => reply.separation === 0)
      .map((reply) => [reply]);

    for (const replyThread of replyThreads) {
      Threadify<ReplyObject>(
        replyThread,
        post.replies,
        (value, leaf) =>
          value.replierId === leaf?.replier?.replies?.[0]?.replierId,
        (value) => !!value?.replier?.replies,
      );
    }

    return { ...post, replyThreads } as MainPostObject;
  }

  return { ...post, replies: undefined } as MainPostObject;
}
