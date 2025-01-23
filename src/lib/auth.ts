import type { Account, NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import SpotifyProvider from "next-auth/providers/spotify";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getTokens } from "~/api/get-tokens";

const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");

spotifyAuthUrl.search = new URLSearchParams({
  scope:
    "user-read-email user-read-private user-read-playback-state user-modify-playback-state",
}).toString();

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, schema) as Adapter,
  session: {
    strategy: "database",
    maxAge: 3600,
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      authorization: spotifyAuthUrl.toString(),
    }),
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.providerAccountId)
        user.providerAccountId = account?.providerAccountId;
      return true;
    },
    session: async ({ session, user }) => {
      if (user) {
        session.user.id = user.id;
        session.user.providerAccountId = user.providerAccountId;
      }

      // get account to refresh token
      const account = (await db.query.accountsTable.findFirst({
        where: eq(schema.accountsTable.userId, user.id),
      })) as Account;

      // request token from spotify
      if (account?.refresh_token) {
        try {
          const { access_token, expires_at } = await getTokens(
            account?.refresh_token,
          );

          await db
            .update(schema.accountsTable)
            .set({ access_token, expires_at })
            .where(eq(schema.accountsTable.userId, user.id));

          session.user.access_token = access_token;
        } catch (error) {
          console.error("Error refreshing access token", error);
        }
      }

      return session;
    },
  },
};
