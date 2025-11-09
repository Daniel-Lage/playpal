"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { usersTable } from "./db/schema";

export async function updateName(userId: string, name: string) {
  await db.update(usersTable).set({ name }).where(eq(usersTable.id, userId));

  revalidatePath("/");
}
