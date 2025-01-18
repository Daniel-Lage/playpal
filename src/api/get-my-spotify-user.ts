"use server";
import type { SpotifyError } from "~/models/error.model";
import type { SpotifyUser } from "~/models/user.model";
import { getTokens } from "./get-tokens";

export async function getMySpotifyUser(userId: string) {
  const tokens = await getTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  if (response.status != 200) {
    const json = (await response.json()) as SpotifyError;

    throw new Error(
      `Status: ${response.statusText}; Error: ${json.error}; Description: ${json.error_description}`,
    );
  }

  const user = (await response.json()) as SpotifyUser;

  return user;
}
