"use server";
import { eq } from "drizzle-orm";
import type { PostObject } from "~/models/post.model";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";

export async function getPostLikes(postId: string) {
  const post = (await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
    with: {
      author: true,
      likes: { with: { liker: true } },
      replies: {
        // only gets direct replies
        where: eq(repliesTable.separation, 0),
      },
    },
  })) as PostObject;

  return post;
}
