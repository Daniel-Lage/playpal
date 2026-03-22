"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { utapi } from "./uploadthing";

export async function updateImage(
  userId: string,
  image: string,
  previousImage?: string | null,
) {
  if (previousImage) {
    const previousImageKey = previousImage.split("/").pop();
    void utapi.deleteFiles(previousImageKey!);
  }

  await db.update(usersTable).set({ image }).where(eq(usersTable.id, userId));

  revalidatePath("/");
}
