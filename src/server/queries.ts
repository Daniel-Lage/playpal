"use server";

import { arrayContains, asc, desc, eq, inArray } from "drizzle-orm";
import { postsTable, accountsTable, usersTable } from "./db/schema";
import { revalidatePath } from "next/cache";
import { db } from "./db";

import type { PostObject } from "~/models/post.model";
import type { Account, User } from "next-auth";

export async function getPosts() {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [desc(postsTable.createdAt)],
    limit: 100,
  });

  return posts;
}

export async function getUserFromSpotifyUserId(
  spotifyUserId: string,
): Promise<User | undefined> {
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

export async function postPost(
  content: string,
  userId: string,
  thread?: string[],
) {
  // used in client

  if (thread && thread.length > 0) {
    await db.insert(postsTable).values({ content, userId, thread }).returning();
  } else await db.insert(postsTable).values({ content, userId }).returning();

  revalidatePath("/");
}

export async function getAccount(userId: string) {
  const account = (await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  })) as Account;

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
}

export async function deletePost(postId: string) {
  // used in client

  await db.delete(postsTable).where(eq(postsTable.id, postId));

  revalidatePath("/");
}

export async function getPost(postId: string): Promise<PostObject | undefined> {
  const post = (await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
    with: { author: true },
  })) as PostObject;

  return post;
}

export async function getReplies(postId: string) {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [desc(postsTable.createdAt)],
    where: arrayContains(postsTable.thread, [postId]),
    limit: 100,
  });

  return posts;
}

export async function getThread(thread: string[]) {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [asc(postsTable.thread)],
    where: inArray(postsTable.id, thread),
    limit: 100,
  });

  return posts;
}
