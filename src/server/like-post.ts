"use server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { likesTable } from "./db/schema";

export async function likePost(postId: string, userId: string) {
  await db.insert(likesTable).values({ postId, userId });

  revalidatePath("/");
}
