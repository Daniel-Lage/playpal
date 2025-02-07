"use server";
import { eq, desc, and, sql } from "drizzle-orm";
import { type PostObject, PostType } from "~/models/post.model";
import { db } from "./db";
import { repliesTable, postsTable } from "./db/schema";

export async function getPosts(lastQueried?: Date) {
  const posts = await db.query.postsTable.findMany({
    with: {
      author: true,
      likes: true,
      replies: {
        // only gets direct replies
        where: eq(repliesTable.separation, 0),
      },
    },
    orderBy: [desc(postsTable.createdAt)],
    where: and(
      eq(postsTable.type, PostType.Post),
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`, // get new posts
    ),
    limit: 100,
  });

  return posts as PostObject[];
}
