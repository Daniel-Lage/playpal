"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { usersTable } from "./db/schema";

export async function deleteUser(userId: string) {
  await db.delete(usersTable).where(eq(usersTable.id, userId));

  revalidatePath("/");
}
