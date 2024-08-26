import { NextResponse, type NextRequest } from "next/server";
import { refreshTokens } from "~/common/utils";
import { type Playlist } from "~/common/types";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  if (!id) return NextResponse.json({ error: "Missing ID Parameter" });

  const tokens = await refreshTokens(req);

  if (!tokens?.access_token) throw new Error("Internal Server Error");

  const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: {
      Authorization: `Bearer  ${tokens.access_token}`,
    },
  });

  if (response.status != 200) throw new Error(response.statusText);

  const json = (await response.json()) as Playlist;

  return NextResponse.json(json);
}
