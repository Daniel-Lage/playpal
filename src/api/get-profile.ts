"use server";
import type { SpotifyProfile } from "~/models/user.model";

export async function getProfile(
  accessToken?: string | null,
): Promise<SpotifyProfile | undefined> {
  if (!accessToken) {
    console.error("Error: accessToken is undefined");
    return;
  }

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Error: Failed to fetch user profile");
    return;
  }

  const profile = (await response.json()) as SpotifyProfile;

  return profile;
}
