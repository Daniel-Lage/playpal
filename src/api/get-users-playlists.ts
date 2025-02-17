"use server";

import type { ApiError } from "~/models/error.model";
import type { Paging } from "~/models/paging.model";
import type { Playlist } from "~/models/playlist.model";
import { getTokens } from "./get-tokens";
import { getProviderAccountId } from "~/server/get-provider-account-id";

export async function getUsersPlaylists(userId: string, accessToken?: string) {
  if (!accessToken) {
    if (process.env.FALLBACK_REFRESH_TOKEN === undefined)
      throw new Error("FALLBACK_REFRESH_TOKEN is not defined in env");

    const { access_token } = await getTokens(
      process.env.FALLBACK_REFRESH_TOKEN,
    );

    if (access_token) accessToken = access_token;
  }

  if (!accessToken) throw new Error("acessToken is undefined");

  const providerAccountId = await getProviderAccountId(userId);

  const response = await fetch(
    `https://api.spotify.com/v1/users/${providerAccountId}/playlists?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;

    throw new Error(
      `Status: ${response.statusText}; Description: ${error?.message};`,
    );
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
            Authorization: `Bearer ${accessToken}`,
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
