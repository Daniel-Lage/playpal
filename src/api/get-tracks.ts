import type { PlaylistTrack } from "~/models/track.model";
import { getTokens } from "./get-tokens";
import type { Paging } from "~/models/paging.model";

export async function getTracks(
  playlistId: string,
  trackTotal: number,
  accessToken?: string | null,
) {
  if (!accessToken) {
    if (process.env.FALLBACK_REFRESH_TOKEN === undefined)
      throw new Error("FALLBACK_REFRESH_TOKEN is not defined in env");

    const { access_token } = await getTokens(
      process.env.FALLBACK_REFRESH_TOKEN,
    );

    if (access_token) accessToken = access_token;
  }
  const tracks: PlaylistTrack[] = [];

  if (!accessToken) throw new Error("acessToken is undefined");

  const url = new URL(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
  );
  const requests = [];

  for (let offset = 0; offset < trackTotal; offset += 100) {
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
    tracks.push(...batch.items);
  });

  return tracks;
}
