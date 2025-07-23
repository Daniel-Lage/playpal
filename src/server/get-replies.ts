"use server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import { repliesTable, postsTable } from "./db/schema";
import type { ReplyObject } from "~/models/reply.model";
import { Threadify } from "~/helpers/get-reply-thread";

export async function getReplies(postId: string, lastQueried?: Date) {
  console.log("getting replies");
  const replies = (await db.query.repliesTable.findMany({
    where: and(
      eq(repliesTable.replieeId, postId),
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`, // get new posts
    ),
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
  })) as ReplyObject[];

  if (replies.length === 0) return [];

  const replyThreads = replies
    .filter((reply) => reply.separation === 0)
    .map((reply) => [reply]);

  for (const replyThread of replyThreads) {
    Threadify<ReplyObject>(
      replyThread,
      replies,
      (value, leaf) =>
        value.replierId === leaf?.replier?.replies?.[0]?.replierId,
      (value) => !!value?.replier?.replies,
    );
  }

  return replyThreads;
}
