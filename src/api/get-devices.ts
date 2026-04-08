import {
  type Devices,
  type GetDevicesResponse,
  GetDevicesStatus,
} from "~/models/device.model";
import type { ApiError } from "~/models/error.model";

export async function getDevices(
  accessToken?: string | null,
): Promise<GetDevicesResponse> {
  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;

    console.error(
      `Status: ${response.statusText}; Description: ${error.error?.message};`,
    );
    return { status: GetDevicesStatus.UseWebPlayer };
  }

  let { devices } = (await response.json()) as Devices;

  devices = devices.filter(
    (device) => device.name !== "Spotify Web Player (PlayPal)",
  );

  if (devices.length > 1) {
    return { status: GetDevicesStatus.ChooseDevice, data: devices };
  }

  return { status: GetDevicesStatus.UseWebPlayer };
}
