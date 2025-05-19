import { getTokens } from "./get-tokens";
import { accountsTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import type { Account } from "next-auth";

export async function refreshTokens(userId: string) {
  const account = (await db.query.accountsTable.findFirst({
    where: eq(accountsTable.userId, userId),
  })) as Account;

  const now = Math.floor(new Date().getTime() / 1000);

  if (
    !account?.access_token ||
    !account?.refresh_token ||
    !account?.expires_at
  ) {
    return;
  }

  if (now < account.expires_at) {
    return {
      access_token: account.access_token,
      expires_at: account.expires_at,
    };
  }

  const { access_token, expires_in } = await getTokens(account.refresh_token);

  if (!access_token || !expires_in) return;

  const expires_at = now + expires_in;

  await db
    .update(accountsTable)
    .set({ access_token, expires_at })
    .where(eq(accountsTable.userId, userId));

  return { access_token, expires_at };
}
