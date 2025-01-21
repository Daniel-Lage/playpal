"use server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { followsTable } from "./db/schema";

export async function followUser(followerId: string, followeeId: string) {
  await db.insert(followsTable).values({ followerId, followeeId });

  revalidatePath("/");
}
