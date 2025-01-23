"use server";
import type { Devices } from "~/models/device.model";
import type { SpotifyError } from "~/models/error.model";

export async function getMyDevices(accessToken: string | null) {
  if (accessToken === null) throw new Error("acessToken is null");

  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
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
