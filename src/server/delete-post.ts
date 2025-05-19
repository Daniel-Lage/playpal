"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";

export async function deletePost(postId: string) {
  const replies = await db.query.repliesTable.findMany({
    where: eq(repliesTable.replieeId, postId),
  });

  await Promise.all(
    replies.map(async (reply) => {
      await db.delete(postsTable).where(eq(postsTable.id, reply.replierId));
    }),
  );

  await db.delete(postsTable).where(eq(postsTable.id, postId));

  revalidatePath("/");
}
