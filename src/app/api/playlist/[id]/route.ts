import { NextResponse, type NextRequest } from "next/server";
import { refreshTokens } from "~/lib/utils";
import type { Paging, PlaylistTrack, Playlist } from "~/lib/types";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  if (!id) return NextResponse.json({ error: "Missing ID Parameter" });

  const tokens = await refreshTokens(req);

  if (!tokens?.access_token)
    return NextResponse.json({ error: "Internal Server Error" });

  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      Authorization: `Bearer  ${tokens.access_token}`,
    },
  });

  if (response.status != 200)
    return NextResponse.json({ error: response.statusText });

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

  return NextResponse.json(playlist);
}
