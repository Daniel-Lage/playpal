"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { likesTable } from "./db/schema";

export async function unlikePost(postId: string, userId: string) {
  await db
    .delete(likesTable)
    .where(and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)));

  revalidatePath("/");
}
