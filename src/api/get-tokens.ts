"use server";
import type { ApiError } from "~/models/error.model";
import type { Tokens } from "~/models/tokens.model";

export async function getTokens(refreshToken: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${process.env.SPOTIFY_CLIENT_CODE ?? ""}`,
    },
  });

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;

    throw new Error(
      `Status: ${response.statusText}; Description: ${error?.message};`,
    );
  }

  return (await response.json()) as Tokens;
}
