import { NextResponse, type NextRequest } from "next/server";
import type { Paging, Playlist } from "~/common/types";
import { refreshTokens } from "~/common/utils";

export async function GET(req: NextRequest) {
  const tokens = await refreshTokens(req);

  if (!tokens?.access_token) throw new Error("Internal Server Error");

  const response = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

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

  return NextResponse.json(playlists.items);
}
