"use server";
import type { Device, Devices } from "~/models/device.model";
import type { ApiError } from "~/models/error.model";
import { PlayTracksStatus } from "~/models/status.model";
import { type PlaylistTrack } from "~/models/track.model";

export async function playTracks(
  tracks: PlaylistTrack[],
  accessToken?: string | null,
  device?: Device,
): Promise<PlayTracksStatus | Device[]> {
  if (!accessToken) {
    console.error("Error: acessToken is undefined");
    return PlayTracksStatus.Failure;
  }
  if (!device) {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: {
          Authorization: `Bearer  ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const { error } = (await response.json()) as ApiError;

      console.error(
        `Status: ${response.statusText}; Description: ${error?.message};`,
      );
      return PlayTracksStatus.Failure;
    }

    const devices = (await response.json()) as Devices;

    if (devices.devices.length > 1) {
      return devices.devices;
    }

    device = devices.devices[0];
  }

  if (!device?.id) {
    console.error("Error: No available spotify device");

    return PlayTracksStatus.NoDevice;
  }

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.error("Error: Tracks: ", tracks);
    console.error("Error: Shuffled Tracks: ", tracks);

    console.error("Empty Track Array");
    return PlayTracksStatus.Failure;
  }

  const addedToQueue = await fetch(
    "https://api.spotify.com/v1/me/player/queue?" +
      new URLSearchParams({
        uri: firstTrack.track.uri,
        device_id: device.id,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${accessToken}`,
      },
    },
  );

  if (!addedToQueue.ok) {
    console.error("Error: Response: ", addedToQueue);
    return PlayTracksStatus.Failure;
  }

  const skipped = await fetch(
    "https://api.spotify.com/v1/me/player/next?" +
      new URLSearchParams({
        device_id: device.id,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${accessToken}`,
      },
    },
  );

  if (!skipped.ok) {
    console.error("Error: Response: ", skipped);
    return PlayTracksStatus.Failure;
  }

  const wait = new Promise((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < tracks.length) {
        const track = tracks[index];
        if (track) {
          track.track.disc_number = index;

          fetch(
            "https://api.spotify.com/v1/me/player/queue?" +
              new URLSearchParams({
                uri: track.track.uri,
                device_id: device.id,
              }).toString(),
            {
              method: "POST",
              headers: {
                Authorization: `Bearer  ${accessToken}`,
              },
            },
          ).catch((e) => {
            console.error(e);
          });
        }
        index++;
      } else {
        resolve(true);
        clearInterval(interval);
      }
    }, 10);
  });

  await wait;

  return PlayTracksStatus.Success;
}
