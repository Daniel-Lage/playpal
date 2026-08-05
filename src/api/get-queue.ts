import type { PlaylistTrack } from "~/models/track.model";
import { getTokens } from "./get-tokens";
import type { Paging } from "~/models/paging.model";
import { getRandomIndexes } from "~/helpers/get-random-indexes";

export async function getQueue(
  playlistEndpoint: string, // me or playlists/{playlist_id}
  trackTotal: number,
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

  if (trackTotal === 0) return [];

  if (!accessToken) throw new Error("accessToken is undefined");

  const url = new URL(
    `https://api.spotify.com/v1/${playlistEndpoint}/tracks?limit=50`,
  );
  const requests = [];

  // max queue of 99
  // todo: implement a way for the user to choose max queue size
  const [orderedIndexes, indexes] = getRandomIndexes(99, trackTotal);

  // starting from the first index, create a new batch at every index that is more than 50 tracks away
  let currentOffset = orderedIndexes[0]!;
  url.searchParams.set("offset", currentOffset.toString());

  requests.push(
    fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );

  for (const index of orderedIndexes) {
    if (Math.abs(index - currentOffset) > 49) {
      // if the index is more than 49 tracks away from the current offset, the batch would be bigger than 50 tracks (50-1 = 49)
      currentOffset = index;
      url.searchParams.set("offset", currentOffset.toString());

      requests.push(
        fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
    }
  }

  const responses = await Promise.all(requests);

  const batchRequests = await Promise.all(
    responses.map((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch tracks: ${response.statusText}`);
      }
      return response.json();
    }),
  );

  const trackByIndex = new Map<number, PlaylistTrack>();

  batchRequests.forEach((batch: Paging<PlaylistTrack>) => {
    batch.items.forEach((item, index) => {
      const globalIndex = batch.offset + index;
      if (indexes.includes(globalIndex)) {
        trackByIndex.set(globalIndex, item);
      }
    });
  });

  return indexes.map((index) => trackByIndex.get(index)!);
}
