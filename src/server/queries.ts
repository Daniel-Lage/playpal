"use server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { postsTable } from "./db/schema";
import { desc } from "drizzle-orm";
import type { Paging, Playlist, PlaylistTrack } from "~/lib/types";
import { refreshTokens } from "~/lib/utils";

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

  console.log("Tokens: ", tokens);

  if (!tokens?.access_token) throw new Error("Internal Server Error");

  const response = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    },
  );

  console.log("Response: ", response);

  if (response.status != 200) throw new Error(response.statusText);

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

  console.log("Tokens: ", tokens);

  if (!tokens?.access_token) throw new Error("Internal Server Error");

  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      Authorization: `Bearer  ${tokens.access_token}`,
    },
  });

  console.log("Response: ", response);

  if (response.status != 200) throw new Error(response.statusText);

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
