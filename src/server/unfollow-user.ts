"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { followsTable } from "./db/schema";

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
