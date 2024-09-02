"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { postsTable, accountsTable } from "./db/schema";
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

export async function getUsersPosts(userId: string) {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [desc(postsTable.createdAt)],
    where: eq(postsTable.userId, userId),
    limit: 100,
  });

  return posts;
}

export async function postPost(content: string, userId: string) {
  if (!content || !userId) {
    console.log("Content: ", content);
    console.log("User ID: ", userId);

    throw new Error("Invalid Post Input");
  }

  const post = (
    await db.insert(postsTable).values({ content, userId }).returning()
  )[0];

  revalidatePath("/");
  revalidatePath("/profile");

  return post;
}

export async function getAccount(userId: string): Promise<Account | null> {
  if (!userId) {
    console.log("User ID: ", userId);

    throw new Error("Invalid userId");
  }

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
