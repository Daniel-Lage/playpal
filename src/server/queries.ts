"use server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { postsTable } from "./db/schema";
import { desc } from "drizzle-orm";
import type { Devices, Paging, Playlist, PlaylistTrack } from "~/lib/types";
import { refreshTokens, shuffleArray } from "~/lib/utils";

export async function getPosts() {
  const posts = await db.query.postsTable.findMany({
    with: { author: true },
    orderBy: [desc(postsTable.createdAt)],
    limit: 100,
  });

  return posts;
}

export async function postPost(content: string, userId: string) {
  if (!content || !userId) {
    console.log("Content: ", content);
    console.log("User ID: ", userId);

    throw new Error("Invalid Post Input");
  }

  const post = (
    await db.insert(postsTable).values({ content, userId }).returning()
  )[0];

  revalidatePath("/");

  return post;
}

export async function getPlaylists(userId: string) {
  const tokens = await refreshTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    },
  );

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  const playlists = (await response.json()) as Paging<Playlist>;

  if (playlists.next) {
    const url = new URL(playlists.next);
    const requests = [];

    for (let offset = 50; offset < playlists.total; offset += 50) {
      url.searchParams.set("offset", offset.toString());

      requests.push(
        fetch(url, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }),
      );
    }

    const responses = await Promise.all(requests);

    const batches = await Promise.all(
      responses.map((response) => response.json()),
    );

    batches.forEach((batch: Paging<Playlist>) => {
      playlists.items = [...playlists.items, ...batch.items];
    });
  }

  return playlists.items;
}

export async function getPlaylist(userId: string, id: string) {
  const tokens = await refreshTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      Authorization: `Bearer  ${tokens.access_token}`,
    },
  });

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  const playlist = (await response.json()) as Playlist;

  if (playlist.tracks.next) {
    const url = new URL(playlist.tracks.next);
    const requests = [];

    for (let offset = 100; offset < playlist.tracks.total; offset += 100) {
      url.searchParams.set("offset", offset.toString());

      requests.push(
        fetch(url, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }),
      );
    }

    const responses = await Promise.all(requests);

    const batches = await Promise.all(
      responses.map((response) => response.json()),
    );

    batches.forEach((batch: Paging<PlaylistTrack>) => {
      playlist.tracks.items = [...playlist.tracks.items, ...batch.items];
    });
  }

  return playlist;
}

export async function getDevices(userId: string) {
  const tokens = await refreshTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer  ${tokens.access_token}`,
    },
  });

  if (response.statusText == "No Content") {
    return [];
  }

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  const devices = (await response.json()) as Devices;

  return devices.devices;
}

export async function play(
  userId: string,
  tracks: PlaylistTrack[],
  deviceId: string,
  firstTrackUri?: string,
) {
  const tokens = await refreshTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const shuffledTracks = shuffleArray(
    tracks.filter((value) => !value.is_local),
  );

  if (firstTrackUri) {
    const trackIndex = shuffledTracks.findIndex(
      (track) => track.track.uri === firstTrackUri,
    );

    const track = shuffledTracks.splice(trackIndex, 1)[0];

    if (track) shuffledTracks.unshift(track);
  }

  const firstTrack = shuffledTracks.shift();

  if (!firstTrack) {
    console.log("Tracks: ", tracks);
    console.log("Shuffled Tracks: ", shuffledTracks);

    throw new Error("Empty Track Array");
  }

  const response = await fetch(
    "https://api.spotify.com/v1/me/player/queue?" +
      new URLSearchParams({
        uri: firstTrack.track.uri,
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  await fetch(
    "https://api.spotify.com/v1/me/player/next?" +
      new URLSearchParams({
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

  shuffledTracks.forEach((track) => {
    void fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({
          uri: track.track.uri,
          device_id: deviceId,
        }).toString(),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer  ${tokens.access_token}`,
        },
      },
    );
  });
}

export async function playFrom(
  userId: string,
  tracks: PlaylistTrack[],
  firstTrackUri: string,
  deviceId?: string,
) {
  if (!deviceId) {
    throw new Error("Invalid Device ID");
  }

  void play(userId, tracks, deviceId, firstTrackUri);
}
