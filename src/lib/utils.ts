import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";
import type { Tokens } from "~/lib/types";
import { db } from "~/server/db";
import { accountsTable } from "~/server/db/schema";

export async function refreshTokens(req: NextRequest): Promise<Tokens | null> {
  const token = await getToken({ req });

  if (!token?.sub) return null;

  const account = (
    await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, token.sub))
      .limit(1)
  )[0];

  if (!account?.refresh_token) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${process.env.SPOTIFY_CLIENT_CODE ?? ""}`,
    },
  });

  const json = (await response.json()) as Tokens;

  return json;
}
