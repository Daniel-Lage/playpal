"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { likesTable } from "./db/schema";

export async function likePost(postId: string, userId: string) {
  const effect = await db
    .insert(likesTable)
    .values({ postId, userId })
    .onConflictDoNothing();

  if (effect.rowCount === 0) throw new Error("Error liking post");

  revalidatePath("/");
}
