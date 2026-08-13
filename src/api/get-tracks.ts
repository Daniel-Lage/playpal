import type { PlaylistTrack } from "~/models/track.model";
import { getTokens } from "~/api/get-tokens";
import type { Paging } from "~/models/paging.model";
import type { ApiError } from "~/models/error.model";

export async function getTracks(
  playlistEndpoint: string, // me or playlists/{playlist_id}
  accessToken?: string | null,
) {
  if (!accessToken) {
    if (process.env.FALLBACK_REFRESH_TOKEN == null)
      throw new Error("FALLBACK_REFRESH_TOKEN is not defined in env");

    const { access_token } = await getTokens(
      process.env.FALLBACK_REFRESH_TOKEN,
    );

    if (access_token) accessToken = access_token;
  }

  if (!accessToken) throw new Error("accessToken is undefined");

  const response = await fetch(
    `https://api.spotify.com/v1/${playlistEndpoint}/tracks?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const { error } = (await response.json()) as ApiError;
    throw new Error(error?.message);
  }

  const result = (await response.json()) as Paging<PlaylistTrack>;

  return result;
}
