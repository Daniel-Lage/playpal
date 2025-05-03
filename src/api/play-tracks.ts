"use server";
import type { Devices } from "~/models/device.model";
import type { ApiError } from "~/models/error.model";
import type { PlaylistTrack } from "~/models/track.model";

export async function playTracks(
  tracks: PlaylistTrack[],
  accessToken?: string | null,
) {
  if (!accessToken) throw new Error("acessToken is undefined");

  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
    },
  });

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;

    throw new Error(
      `Status: ${response.statusText}; Description: ${error?.message};`,
    );
  }

  const devices = (await response.json()) as Devices;

  if (!devices.devices[0]?.id) throw new Error("No available spotify device");

  const deviceId = devices.devices[0].id;

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.error("Error: Tracks: ", tracks);
    console.error("Error: Shuffled Tracks: ", tracks);

    throw new Error("Empty Track Array");
  }

  const addedToQueue = await fetch(
    "https://api.spotify.com/v1/me/player/queue?" +
      new URLSearchParams({
        uri: firstTrack.track.uri,
        device_id: deviceId,
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

    throw new Error(addedToQueue.statusText);
  }

  const skipped = await fetch(
    "https://api.spotify.com/v1/me/player/next?" +
      new URLSearchParams({
        device_id: deviceId,
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

    throw new Error(skipped.statusText);
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
                device_id: deviceId,
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

  return await wait;
}
