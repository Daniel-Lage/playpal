"use server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { accountsTable } from "./db/schema";

export async function getProviderAccountId(
  userId: string,
): Promise<string | undefined> {
  const account = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  });
  return account?.providerAccountId;
}
