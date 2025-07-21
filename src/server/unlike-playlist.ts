"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { playlistLikesTable } from "./db/schema";

export async function unlikePlaylist(playlistId: string, userId: string) {
  const effect = await db
    .delete(playlistLikesTable)
    .where(
      and(
        eq(playlistLikesTable.playlistId, playlistId),
        eq(playlistLikesTable.userId, userId),
      ),
    );

  if (effect.rowCount === 0) throw new Error("Error unliking post");

  revalidatePath("/");
}
