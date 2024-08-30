import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import SpotifyProvider from "next-auth/providers/spotify";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, schema) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
