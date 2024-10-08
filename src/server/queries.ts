"use server";

import { and, desc, eq } from "drizzle-orm";
import {
  postsTable,
  accountsTable,
  usersTable,
  repliesTable,
  likesTable,
  followsTable,
} from "./db/schema";
import { revalidatePath } from "next/cache";
import { db } from "./db";

import {
  PostType,
  type ClientPostObject,
  type IMetadata,
  type parentPostObject,
  type PostObject,
  type Substring,
} from "~/models/post.model";
import type { Account } from "next-auth";
import type { ReplyObject } from "~/models/reply.model";
import type { UserObject } from "~/models/user.model";

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

export async function getUser(
  profileId: string,
): Promise<UserObject | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
    with: {
      posts: {
        with: {
          author: true,
          likes: true,
          replies: {
            // only gets direct replies
            where: eq(repliesTable.separation, 0),
          },
        },
      },
      likes: {
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
      },
      followers: true,
      following: true,
    },
  });

  return user as UserObject;
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
      .values({
        content,
        userId,
        type: PostType.Reply,
        urls,
        urlMetadata: metadata,
      })
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
      .values({
        content,
        userId,
        type: PostType.Post,
        urls,
        urlMetadata: metadata,
      })
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
        with: {
          repliee: {
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

export async function followUser(followerId: string, followeeId: string) {
  await db.insert(followsTable).values({ followerId, followeeId });

  revalidatePath("/");
}

export async function unfollowUser(followerId: string, followeeId: string) {
  await db
    .delete(followsTable)
    .where(
      and(
        eq(followsTable.followerId, followerId),
        eq(followsTable.followeeId, followeeId),
      ),
    );

  revalidatePath("/");
}

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

export async function getUserFollowing(
  profileId: string,
): Promise<UserObject | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
    with: {
      following: { with: { followee: true } },
    },
  });

  return user as UserObject;
}

export async function getUserFollowers(
  profileId: string,
): Promise<UserObject | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
    with: {
      followers: { with: { follower: true } },
    },
  });

  return user as UserObject;
}
