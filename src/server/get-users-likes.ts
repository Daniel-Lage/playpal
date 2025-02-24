"use server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { likesTable, repliesTable } from "./db/schema";
import type { PostObject } from "~/models/post.model";

export async function getUsersLikes(
  userId: string,
  lastQueried?: Date,
): Promise<PostObject[]> {
  const likes = await db.query.likesTable.findMany({
    where: and(
      eq(likesTable.userId, userId),

      lastQueried && sql`${likesTable.createdAt} > ${lastQueried}`, // get new posts
    ),
    with: {
      likee: {
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
  });

  const posts = likes.map((like) => like.likee);

  return posts as PostObject[];
}
