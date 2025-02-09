"use server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { followsTable } from "./db/schema";
import type { FollowObject } from "~/models/follow.model";

export async function getUsersFollowers(
  userId: string,
): Promise<FollowObject[]> {
  const follows = await db.query.followsTable.findMany({
    where: eq(followsTable.followeeId, userId),
    with: { follower: true },
  });

  return follows as FollowObject[];
}
