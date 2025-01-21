"use server";
import { eq } from "drizzle-orm";
import type { Account } from "next-auth";
import { db } from "./db";
import { accountsTable } from "./db/schema";

export async function getAccount(userId: string) {
  const account = (await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  })) as Account;

  if (!account?.refresh_token) {
    console.log("Account: ", account);

    throw new Error("Invalid account");
  }

  return account;
}
