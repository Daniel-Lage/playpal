import "only-server";
import { db } from "./db";
import { postsTable, usersTable } from "./db/schema";
import { desc, inArray } from "drizzle-orm";

export async function getPosts() {
  const posts = await db
    .select()
    .from(postsTable)
    .limit(100)
    .orderBy(desc(postsTable.createdAt));

  const users = await db
    .select()
    .from(usersTable)
    .limit(100)
    .where(
      inArray(
        usersTable.id,
        posts.map((post) => post.userId),
      ),
    );

  return posts.map((post) => ({
    ...post,
    author: users.find((value) => value.id == post.userId),
  }));
}
