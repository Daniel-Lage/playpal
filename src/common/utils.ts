import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";
import type { Tokens } from "~/common/types";
import { db } from "~/server/db";
import { accountsTable } from "~/server/db/schema";

export async function refreshTokens(req: NextRequest): Promise<Tokens | null> {
  const token = await getToken({ req });

  if (!token?.sub) return null;

  const data = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, token.sub))
    .limit(1);

  return data[0] as Tokens;
}
