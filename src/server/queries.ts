"use server";

import { and, desc, eq } from "drizzle-orm";
import {
  postsTable,
  accountsTable,
  usersTable,
  repliesTable,
  likesTable,
} from "./db/schema";
import { revalidatePath } from "next/cache";
import { db } from "./db";

import type {
  ClientPostObject,
  IMetadata,
  parentPostObject,
  PostObject,
  Substring,
} from "~/models/post.model";
import type { Account, User } from "next-auth";
import type { ReplyObject } from "~/models/reply.model";

export async function getPosts() {
  const posts = await db.query.postsTable.findMany({
    with: { author: true, likes: true },
    orderBy: [desc(postsTable.createdAt)],
    where: eq(postsTable.type, "post"),
    limit: 100,
  });

  return posts;
}

export async function getUser(profileId: string): Promise<User | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
  });

  return user;
}

export async function getUsersPosts(authorId: string) {
  const posts = await db.query.postsTable.findMany({
    with: { author: true, likes: true },
    orderBy: [desc(postsTable.createdAt)],
    where: and(eq(postsTable.userId, authorId), eq(postsTable.type, "post")),
    limit: 100,
  });

  return posts;
}
export async function getUsersPostsAndReplies(authorId: string) {
  const posts = await db.query.postsTable.findMany({
    with: { author: true, likes: true },
    orderBy: [desc(postsTable.createdAt)],
    where: eq(postsTable.userId, authorId),
    limit: 100,
  });

  return posts;
}

export async function postPost(
  content: string,
  userId: string,
  parent?: parentPostObject,
  urls?: Substring[],
  metadata?: IMetadata,
) {
  // used in client
  if (parent) {
    const posts = await db
      .insert(postsTable)
      .values({ content, userId, type: "reply", urls, urlMetadata: metadata })
      .returning();

    const postId = posts[0]?.id;

    if (postId) {
      await db
        .insert(repliesTable)
        .values({ replierId: postId, replieeId: parent.id, separation: 0 });

      if (parent.thread) {
        const newThread = [...parent.thread];
        newThread.reverse();
        for (let index = 0; index <= newThread.length; index++) {
          const replieeId = newThread[index]?.replieeId;
          if (replieeId)
            await db.insert(repliesTable).values({
              replierId: postId,
              replieeId,
              separation: index + 1,
            });
        }
      }
    }
  } else
    await db
      .insert(postsTable)
      .values({ content, userId, type: "post", urls, urlMetadata: metadata })
      .returning();

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

export async function getPost(
  postId: string,
): Promise<ClientPostObject | undefined> {
  const post = (await db.query.postsTable.findFirst({
    where: eq(postsTable.id, postId),
    with: {
      author: true,
      likes: true,
      thread: {
        orderBy: [desc(repliesTable.separation)],
        with: { repliee: { with: { author: true, likes: true } } },
      },
      replies: {
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
      },
    },
  })) as PostObject;

  if (post?.replies) {
    const replies = post.replies
      .filter((reply) => reply.separation === 0)
      .map((reply) => [reply]);

    for (const replyThread of replies) {
      getReplyThread(replyThread, post.replies);
    }

    return { ...post, replies } as ClientPostObject;
  }

  return { ...post, replies: undefined } as ClientPostObject;
}

function getReplyThread(replyThread: ReplyObject[], replies: ReplyObject[]) {
  const leaf = replyThread.at(-1);

  const newLeaf = replies.find(
    (reply) => reply.replierId === leaf?.replier?.replies?.[0]?.replierId,
  );

  if (newLeaf) replyThread.push(newLeaf);

  if (newLeaf?.replier?.replies) {
    getReplyThread(replyThread, replies);
  }
}

export async function likePost(postId: string, userId: string) {
  await db.insert(likesTable).values({ postId, userId });

  revalidatePath("/");
}

export async function unlikePost(postId: string, userId: string) {
  await db
    .delete(likesTable)
    .where(and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)));

  revalidatePath("/");
}
