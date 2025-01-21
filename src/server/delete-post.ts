"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { postsTable } from "./db/schema";

export async function deletePost(postId: string) {
  await db.delete(postsTable).where(eq(postsTable.id, postId));

  revalidatePath("/");
}
