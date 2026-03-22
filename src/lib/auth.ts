import { type NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import SpotifyProvider from "next-auth/providers/spotify";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { loadPlaylists } from "~/server/load-playlists";
import { eq } from "drizzle-orm";
import { sendVerificationRequest } from "./custom-verification-request";
import { getTokens } from "~/api/get-tokens";

const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");

spotifyAuthUrl.search = new URLSearchParams({
  scope:
    "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state",
}).toString();

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, schema) as Adapter,
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-email",
  },
  session: {
    strategy: "database",
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      authorization: spotifyAuthUrl.toString(),
    }),
    EmailProvider({
      server: {
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id;

      const account = await db.query.accountsTable.findFirst({
        where: eq(schema.accountsTable.userId, user.id),
      });

      if (
        account?.access_token == null ||
        account?.refresh_token == null ||
        account?.expires_at == null
      ) {
        return session;
      }

      session.user.providerAccountId = account.providerAccountId;
      session.user.access_token = account.access_token;
      session.user.expires_at = account.expires_at;

      const now = Math.floor(new Date().getTime() / 1000);

      if (now < account.expires_at) {
        return session;
      }

      const { access_token, expires_in } = await getTokens(
        account.refresh_token,
      );

      if (access_token == null || expires_in == null) {
        return session;
      }

      const expires_at = now + expires_in;
      session.user.access_token = access_token;
      session.user.expires_at = expires_at;

      await db
        .update(schema.accountsTable)
        .set({ access_token, expires_at })
        .where(eq(schema.accountsTable.userId, user.id));

      await loadPlaylists(access_token, user.id);

      return session;
    },
  },
};
