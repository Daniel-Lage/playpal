import { getServerSession, type NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import SpotifyProvider from "next-auth/providers/spotify";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { refreshTokens } from "~/api/refresh-tokens";
import { loadPlaylists } from "~/server/load-playlists";
import { eq } from "drizzle-orm";
import { sendVerificationRequest } from "./custom-verification-request";

const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");

spotifyAuthUrl.search = new URLSearchParams({
  scope:
    "user-read-email user-read-private user-read-playback-state user-modify-playback-state",
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
    signIn: async ({ account }) => {
      const session = await getServerSession(authOptions);

      if (!session) return true; // logging in for the first time with spotify

      // connecting spotify to an existing account
      if (session?.user?.spotify_id) return true;

      if (account?.provider === "spotify") {
        await db
          .update(schema.usersTable)
          .set({
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            spotify_id: account.providerAccountId,
          })
          .where(eq(schema.usersTable.id, session?.user.id));
      }

      return true;
    },
    session: async ({ session, user }) => {
      if (user) session.user.id = user.id;

      if (!user.spotify_id) return session;

      const tokens = await refreshTokens(user.id);

      if (!tokens) return session;

      await loadPlaylists(tokens.access_token, user.id);

      session.user.access_token = tokens.access_token;
      session.user.expires_at = tokens.expires_at;

      return session;
    },
  },
};
