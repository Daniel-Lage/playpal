"use server";

import type { ApiError } from "~/models/error.model";
import type { Paging } from "~/models/paging.model";
import type { Playlist, PlaylistChanges } from "~/models/playlist.model";
import { db } from "./db";
import { playlistsTable } from "./db/schema";
import { getPlaylists } from "./get-playlists";
import { eq, inArray } from "drizzle-orm";

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

  const wasDeleted = await getPlaylists({ userIds: [userId] });

  const wasUpdated: PlaylistChanges[] = [];
  const wasCreated: Playlist[] = [];

  for (const playlist of playlists.items) {
    const oldPlaylist = wasDeleted.find(
      (oldPlaylist) => oldPlaylist.id === playlist.id,
    );
    if (oldPlaylist) {
      const changes: PlaylistChanges = { id: playlist.id };
      let hasChanged = false;

      if (oldPlaylist.name != playlist.name) {
        changes.name = playlist.name;
        hasChanged = true;
      }
      if (oldPlaylist.image != playlist.images[0]?.url) {
        changes.image = playlist.images[0]?.url ?? "";
        hasChanged = true;
      }
      if (oldPlaylist.totalTracks != playlist.tracks.total) {
        changes.totalTracks = playlist.tracks.total;
        hasChanged = true;
      }
      if (oldPlaylist.description != playlist.description) {
        changes.description = playlist.description ?? undefined;
        hasChanged = true;
      }

      if (hasChanged) {
        wasUpdated.push(changes);
      }
    } else {
      wasCreated.push(playlist);
    }
  }

  for (const change of wasUpdated) {
    await db
      .update(playlistsTable)
      .set(change)
      .where(eq(playlistsTable.id, change.id));
  }

  await db.delete(playlistsTable).where(
    inArray(
      playlistsTable.id,
      wasDeleted.map((playlist) => playlist.id),
    ),
  );

  await db
    .insert(playlistsTable)
    .values(
      playlists.items.map((playlist) => {
        return {
          userId: userId,
          id: playlist.id,
          name: playlist.name,
          image: playlist.images[0]?.url ?? "",
          totalTracks: playlist.tracks.total,
          externalUrl: playlist.external_urls.spotify,
          description: playlist.description,
        };
      }),
    )
    .onConflictDoNothing();
}
