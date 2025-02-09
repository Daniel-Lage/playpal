"use server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { likesTable, repliesTable } from "./db/schema";
import type { LikeObject } from "~/models/like.model";

export async function getUsersLikes(userId: string): Promise<LikeObject[]> {
  const likes = await db.query.likesTable.findMany({
    where: eq(likesTable.userId, userId),
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

  return likes as LikeObject[];
}
