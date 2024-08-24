import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) return NextResponse.json({ error: "Internal Server Error" });

  const response = await fetch(
    "https://api.spotify.com/v1/me/playlists?limit=50",
    {
      headers: {
        Authorization: "Bearer " + token.accessToken,
      },
    },
  );

  if (response.status != 200)
    return NextResponse.json({ error: "Request Form Error" });

  const playlists = await response.json();

  if (playlists.next) {
    const url = new URL(playlists.next);
    const requests = [];

    for (let offset = 50; offset < playlists.total; offset += 50) {
      url.searchParams.set("offset", offset.toString());

      requests.push(
        fetch(url, {
          headers: {
            Authorization: "Bearer " + token.accessToken,
          },
        }),
      );
    }

    const responses = await Promise.all(requests);

    const batches = await Promise.all(
      responses.map((response) => response.json()),
    );

    batches.forEach((batch) => {
      playlists.items = [...playlists.items, ...batch.items];
    });
  }

  return NextResponse.json(playlists.items);
}