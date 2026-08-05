"use server";
import type { ApiError } from "~/models/error.model";
import { ActionStatus } from "~/models/status.model";
import type { PlaylistTrack } from "~/models/track.model";

export async function playTracks(
  tracks: PlaylistTrack[],
  deviceId: string,
  accessToken?: string | null,
): Promise<ActionStatus> {
  if (!accessToken) {
    console.error("Error: accessToken is undefined");
    return ActionStatus.Failure;
  }

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.error("Error: Tracks: ", tracks);
    console.error("Error: Shuffled Tracks: ", tracks);

    console.error("Empty Track Array");
    return ActionStatus.Failure;
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
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!addedToQueue.ok) {
    const { error } = (await addedToQueue.json()) as ApiError;

    console.error("Error: Response: ", error?.message);

    throw new Error(
      `Status: ${addedToQueue.statusText}; Description: ${error?.message};`,
    );
  }

  const skipped = await fetch(
    "https://api.spotify.com/v1/me/player/next?" +
      new URLSearchParams({
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!skipped.ok) {
    const { error } = (await skipped.json()) as ApiError;

    console.error("Error: Response: ", error);
    return ActionStatus.Failure;
  }

  for (const { track } of tracks) {
    await fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({
          uri: track.uri,
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).catch((e) => {
      console.error(e);
    });

    const sleep = new Promise((resolve) => setTimeout(resolve, 10));

    await sleep;
  }

  return ActionStatus.Success;
}
