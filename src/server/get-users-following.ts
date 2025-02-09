"use server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { followsTable } from "./db/schema";
import type { FollowObject } from "~/models/follow.model";

export async function getUsersFollowing(
  userId: string,
): Promise<FollowObject[]> {
  const follows = await db.query.followsTable.findMany({
    where: eq(followsTable.followerId, userId),
    with: { followee: true },
  });

  return follows as FollowObject[];
}
