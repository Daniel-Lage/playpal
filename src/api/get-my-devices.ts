"use server";
import type { Devices } from "~/models/device.model";
import type { SpotifyError } from "~/models/error.model";
import { getTokens } from "./get-tokens";

export async function getMyDevices(userId: string) {
  const tokens = await getTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${tokens.access_token}`,
    },
  });

  if (response.statusText === "No Content") {
    return [];
  }

  if (response.status != 200) {
    const json = (await response.json()) as SpotifyError;

    throw new Error(
      `Status: ${response.statusText}; Error: ${json.error}; Description: ${json.error_description}`,
    );
  }

  const devices = (await response.json()) as Devices;

  return devices.devices;
}
