"use server";
import type { SpotifyError } from "~/models/error.model";
import type { Paging } from "~/models/paging.model";
import type { Playlist } from "~/models/playlist.model";
import type { PlaylistTrack } from "~/models/track.model";
import { getTokens } from "./get-tokens";

export async function getPlaylist(
  accessToken: string | null | undefined,
  playlistId: string,
): Promise<Playlist | undefined> {
  if (!accessToken) {
    if (process.env.FALLBACK_REFRESH_TOKEN === undefined)
      throw new Error("FALLBACK_REFRESH_TOKEN is not defined in env");

    const { access_token } = await getTokens(
      process.env.FALLBACK_REFRESH_TOKEN,
    );

    accessToken = access_token;
  }

  if (accessToken === null) throw new Error("acessToken is null");

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer  ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const json = (await response.json()) as SpotifyError;

    if (json?.error && json?.error_description)
      throw new Error(
        `Status: ${response.statusText}; Error: ${json.error}; Description: ${json.error_description}`,
      );

    throw new Error(`Status: ${response.statusText}`);
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
