"use server";
import { eq, desc, and, sql, ilike } from "drizzle-orm";
import { db } from "./db";
import { repliesTable, postsTable, usersTable } from "./db/schema";
import type { UserObject } from "~/models/user.model";
import type { PostObject } from "~/models/post.model";

export async function getSearchResults(
  searchQuery: string,
  lastQueried?: Date,
) {
  const posts = (await db.query.postsTable.findMany({
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
      ilike(postsTable.content, `%${searchQuery}%`),
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`, // get new posts
    ),
    limit: 100,
  })) as PostObject[];

  const users = (await db.query.usersTable.findMany({
    where: and(
      ilike(usersTable.name, `%${searchQuery}%`),
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`, // get new posts
    ),
  })) as UserObject[];

  return { users, posts };
}
