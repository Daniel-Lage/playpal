"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { playlistLikesTable } from "./db/schema";

export async function likePlaylist(playlistId: string, userId: string) {
  const effect = await db
    .insert(playlistLikesTable)
    .values({ playlistId, userId })
    .onConflictDoNothing();

  if (effect.rowCount === 0) throw new Error("Error liking post");

  revalidatePath("/");
}
