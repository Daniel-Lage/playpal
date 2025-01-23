"use server";
import type { SpotifyError } from "~/models/error.model";
import type { SpotifyUser } from "~/models/user.model";

export async function getMySpotifyUser(accessToken: string | null) {
  if (accessToken === null) throw new Error("acessToken is null");

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
