"use server";
import type { Devices } from "~/models/device.model";
import type { SpotifyError } from "~/models/error.model";
import type { PlaylistTrack } from "~/models/track.model";

export async function playTracks(
  accessToken: string | null,
  tracks: PlaylistTrack[],
) {
  if (accessToken === null) throw new Error("acessToken is null");

  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
    },
  });

  if (!response.ok) {
    const json = (await response.json()) as SpotifyError;

    throw new Error(
      `Status: ${response.statusText}; Error: ${json.error}; Description: ${json.error_description}`,
    );
  }

  const devices = (await response.json()) as Devices;

  if (!devices.devices[0]?.id) throw new Error("No available spotify device");

  const deviceId = devices.devices[0].id;

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.log("Tracks: ", tracks);
    console.log("Shuffled Tracks: ", tracks);

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
    console.log("Response: ", addedToQueue);

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
    console.log("Response: ", skipped);

    throw new Error(skipped.statusText);
  }

  for (let index = 0; index < tracks.length; index++) {
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
  }
}
