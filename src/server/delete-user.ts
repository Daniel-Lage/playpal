"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { utapi } from "./uploadthing";

export async function deleteUser(userId: string) {
  const result = await db
    .delete(usersTable)
    .where(eq(usersTable.id, userId))
    .returning();

  if (result[0]?.image) {
    const previousImageKey = result[0]?.image.split("/").pop();
    void utapi.deleteFiles(previousImageKey!);
  }

  revalidatePath("/");
}
