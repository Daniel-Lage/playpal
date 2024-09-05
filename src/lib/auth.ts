import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import SpotifyProvider from "next-auth/providers/spotify";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, schema) as Adapter,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
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
        session.user = user;
      }
      return session;
    },
  },
};
