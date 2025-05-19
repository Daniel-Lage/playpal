"use server";
import type { ApiError } from "~/models/error.model";
import type { Paging } from "~/models/paging.model";
import type { Playlist } from "~/models/playlist.model";
import type { PlaylistTrack } from "~/models/track.model";
import { getTokens } from "./get-tokens";

export async function getPlaylist(
  playlistId: string,
  accessToken?: string | null,
): Promise<Playlist | undefined> {
  if (!accessToken) {
    if (process.env.FALLBACK_REFRESH_TOKEN === undefined)
      throw new Error("FALLBACK_REFRESH_TOKEN is not defined in env");

    const { access_token } = await getTokens(
      process.env.FALLBACK_REFRESH_TOKEN,
    );

    if (access_token) accessToken = access_token;
  }

  if (!accessToken) throw new Error("acessToken is undefined");

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer  ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;

    throw new Error(
      `Status: ${response.statusText}; Description: ${error?.message};`,
    );
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
            Authorization: `Bearer ${accessToken}`,
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
