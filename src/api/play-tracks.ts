"use server";
import type { Devices } from "~/models/device.model";
import type { ApiError } from "~/models/error.model";
import { type PlaylistTrack, playTracksStatus } from "~/models/track.model";

export async function playTracks(
  tracks: PlaylistTrack[],
  accessToken?: string | null,
): Promise<playTracksStatus> {
  if (!accessToken) {
    console.error("Error: acessToken is undefined");
    return playTracksStatus.ServerError;
  }

  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
    },
  });

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;

    console.error(
      `Status: ${response.statusText}; Description: ${error?.message};`,
    );
    return playTracksStatus.ServerError;
  }

  const devices = (await response.json()) as Devices;

  if (!devices.devices[0]?.id) {
    console.error("Error: No available spotify device");

    return playTracksStatus.NoDevice;
  }

  const deviceId = devices.devices[0].id;

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.error("Error: Tracks: ", tracks);
    console.error("Error: Shuffled Tracks: ", tracks);

    console.error("Empty Track Array");
    return playTracksStatus.ServerError;
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
    return playTracksStatus.ServerError;
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
    return playTracksStatus.ServerError;
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

  await wait;

  return playTracksStatus.Sucess;
}
