import { eq } from "drizzle-orm";
import type { Tokens } from "~/lib/types";
import { db } from "~/server/db";
import { accountsTable } from "~/server/db/schema";

export async function refreshTokens(userId: string): Promise<Tokens | null> {
  if (!userId) {
    console.log("User ID: ", userId);

    throw new Error("Invalid userId");
  }

  const account = (
    await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId))
      .limit(1)
  )[0];

  if (!account?.refresh_token) {
    console.log("Account: ", account);

    throw new Error("Invalid account");
  }

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

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  const json = (await response.json()) as Tokens;

  return json;
}

export function shuffleArray<T>(array: Array<T>): Array<T> {
  const newArray: Array<T> = [];
  const prevArray = [...array];
  while (prevArray.length) {
    const index = Math.floor(Math.random() * prevArray.length);
    const item = prevArray.splice(index, 1)[0];
    if (item) newArray.push(item);
  }
  return newArray;
}
