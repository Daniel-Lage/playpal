"use server";
import type { SpotifyError } from "~/models/error.model";
import type { Tokens } from "~/models/tokens.model";
import { getAccount } from "~/server/get-account";

export async function getTokens(userId?: string) {
  if (!userId) return;

  const account = await getAccount(userId);
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
    const json = (await response.json()) as SpotifyError;

    throw new Error(
      `Status: ${response.statusText}; Error: ${json.error}; Description: ${json.error_description}`,
    );
  }

  const json = (await response.json()) as Tokens;

  return json;
}
