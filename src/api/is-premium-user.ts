"use server";
import type { ApiError } from "~/models/error.model";
import type { SpotifyUser } from "~/models/user.model";

export async function isPremiumUser(accessToken?: string | null) {
  if (!accessToken) throw new Error("acessToken is undefined");

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;

    throw new Error(
      `Status: ${response.statusText}; Description: ${error?.message};`,
    );
  }

  const user = (await response.json()) as SpotifyUser;

  return user.product === "premium";
}
