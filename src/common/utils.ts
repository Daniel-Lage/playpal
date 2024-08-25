import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";
import type { Tokens } from "~/common/types";

export async function refreshTokens(
  req: NextRequest,
): Promise<Tokens | undefined> {
  const token = await getToken({ req });

  if (!token) return;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      refresh_token: token.refreshToken as string,
      grant_type: "refresh_token",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${process.env.SPOTIFY_CLIENT_CODE ?? ""}`,
    },
  });

  const json = (await response.json()) as Tokens;

  return json;
}
