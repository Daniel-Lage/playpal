"use server";

import { getAccount } from "~/server/queries";
import type { Devices, PlaylistTrack, Tokens, Paging, Playlist } from "./types";

export async function getPlaylists(userId: string, spotifyUserId?: string) {
  const tokens = await getTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = spotifyUserId
    ? await fetch(
        `https://api.spotify.com/v1/users/${spotifyUserId}/playlists?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        },
      )
    : await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

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
  const tokens = await getTokens(userId);

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

export async function getTokens(userId: string) {
  const account = await getAccount(userId);

  if (!account?.refresh_token) {
    console.log("Account: ", account);

    throw new Error("Invalid account");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      refresh_token: account.refresh_token,
      grant_type: "refresh_token",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${process.env.SPOTIFY_CLIENT_CODE ?? ""}`,
    },
  });

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  const json = (await response.json()) as Tokens;

  return json;
}

export async function getSpotifyUser(userId: string, spotifyUserId?: string) {
  const tokens = await getTokens(userId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const response = spotifyUserId
    ? await fetch(`https://api.spotify.com/v1/users/${spotifyUserId}`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })
    : await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

  if (response.status != 200) {
    console.log("Response: ", response);

    throw new Error(response.statusText);
  }

  const user = await response.json();

  return user;
}
