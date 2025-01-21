"use server";
import { eq, desc } from "drizzle-orm";
import { PostType } from "~/models/post.model";
import { db } from "./db";
import { repliesTable, postsTable } from "./db/schema";

export async function getPosts() {
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
    where: eq(postsTable.type, PostType.Post),
    limit: 100,
  });

  return posts;
}
