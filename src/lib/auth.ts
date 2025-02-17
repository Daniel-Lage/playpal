import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import SpotifyProvider from "next-auth/providers/spotify";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { refreshTokens } from "~/api/refresh-tokens";

const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");

spotifyAuthUrl.search = new URLSearchParams({
  scope:
    "user-read-email user-read-private user-read-playback-state user-modify-playback-state",
}).toString();

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, schema) as Adapter,
  session: {
    strategy: "database",
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      authorization: spotifyAuthUrl.toString(),
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (user) session.user.id = user.id;

      const tokens = await refreshTokens(user.id);

      if (!tokens) return session;

      session.user.access_token = tokens.access_token;
      session.user.expires_at = tokens.expires_at;

      return session;
    },
  },
};
