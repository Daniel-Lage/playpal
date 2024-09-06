"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { postsTable, accountsTable, usersTable } from "./db/schema";
import { desc, eq } from "drizzle-orm";

import type { Account } from "next-auth";

export async function getPosts() {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [desc(postsTable.createdAt)],
    limit: 100,
  });

  return posts;
}

export async function getUserFromSpotifyUserId(spotifyUserId: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, spotifyUserId),
  });

  return user;
}

export async function getUsersPosts(authorId: string) {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [desc(postsTable.createdAt)],
    where: eq(postsTable.userId, authorId),
    limit: 100,
  });

  return posts;
}

export async function postPost(content: string, userId: string) {
  // used in client

  await db.insert(postsTable).values({ content, userId }).returning();

  revalidatePath("/");
  revalidatePath("/profile");
}

export async function getAccount(userId: string): Promise<Account | null> {
  const account = (
    await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId))
      .limit(1)
  )[0] as Account;

  if (!account?.refresh_token) {
    console.log("Account: ", account);

    throw new Error("Invalid account");
  }

  return account;
}

export async function deleteUser(userId: string) {
  // used in client

  await db.delete(usersTable).where(eq(usersTable.id, userId));

  revalidatePath("/");
  revalidatePath("/profile");
}

export async function deletePost(postId: string) {
  // used in client

  await db.delete(postsTable).where(eq(postsTable.id, postId));

  revalidatePath("/");
  revalidatePath("/profile");
}
