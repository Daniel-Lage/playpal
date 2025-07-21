"use server";

import type { ApiError } from "~/models/error.model";
import type { Paging } from "~/models/paging.model";
import type { Playlist } from "~/models/playlist.model";
import { db } from "./db";
import { playlistsTable } from "./db/schema";

export async function loadPlaylists(accessToken: string, userId: string) {
  const response = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
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

  await db
    .insert(playlistsTable)
    .values(
      playlists.items.map(
        ({
          id,
          images,
          name,
          external_urls: { spotify },
          tracks: { total },
          description,
        }) => ({
          id,
          userId,
          name,
          image: images[0]?.url ?? "",
          totalTracks: total,
          externalUrl: spotify,
          description,
        }),
      ),
    )
    .onConflictDoNothing();
}
